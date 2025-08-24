import time, uuid, re
from typing import Iterable, Optional
from app.models.audit import ActorKind, AuditStatus
from app.audit.audit import write_audit
from app.audit.change_tracker import audit_changes_buffer
from app.utils.security import load_user_from_token

from app.utils.feature_flags import env_bool
AUDIT_API_ENABLED = env_bool("AUDIT_API_ENABLED", True)

def decode_access_token(token: str) -> Optional[dict]:
    try:
        from app.utils.security import SECRET_KEY, ALGORITHM
        from jose import jwt, JWTError
        try:
            return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        except JWTError:
            return None
    except Exception:
        return None

UUID_RE = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$"
)

class AuditMiddleware:

    def __init__(
        self,
        app,
        db_session_factory,
        exclude_prefixes: Iterable[str] = ("/docs", "/redoc", "/openapi.json", "/health", "/metrics", "/favicon.ico"),
    ):
        self.app = app
        self.db_session_factory = db_session_factory
        self.exclude_prefixes = tuple(exclude_prefixes)

    def _should_skip(self, root_path: str, path: str) -> bool:
        full = f"{root_path}{path}" if root_path else path
        return any(full.startswith(p) or path.startswith(p) for p in self.exclude_prefixes)

    @staticmethod
    def _headers(scope) -> dict:
        return {k.decode().lower(): v.decode() for k, v in scope.get("headers", [])}

    @staticmethod
    def _guess_target(path: str, root_path: str) -> tuple[Optional[str], Optional[str]]:
        full = f"{root_path}{path}" if root_path else path
        parts = [p for p in full.split("/") if p]
        if parts and parts[0] == "api":
            parts = parts[1:]
        if not parts:
            return None, None
        ttype = parts[0]
        tid = None
        if len(parts) > 1:
            candidate = parts[1]
            if UUID_RE.match(candidate) or candidate.isdigit():
                tid = candidate
        return ttype, tid

    def _decode_user_from_bearer(self, headers: dict) -> tuple[Optional[str], Optional[str]]:
        auth = headers.get("authorization")
        if not auth or not auth.lower().startswith("bearer "):
            return None, None
        token = auth.split(" ", 1)[1].strip()
        payload = None
        if decode_access_token:
            try:
                payload = decode_access_token(token)
            except Exception:
                payload = None

        if not isinstance(payload, dict):
            return None, None
        uid = payload.get("sub") or payload.get("user_id")
        uname = payload.get("username") or payload.get("name")
        return (str(uid) if uid else None, str(uname) if uname else None)

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or not AUDIT_API_ENABLED:
            return await self.app(scope, receive, send)

        path = scope.get("path", "")
        root_path = scope.get("root_path", "") or ""
        method = scope.get("method", "GET")
        if self._should_skip(root_path, path):
            return await self.app(scope, receive, send)

        headers = self._headers(scope)
        request_id = headers.get("x-request-id") or str(uuid.uuid4())
        correlation_id = headers.get("x-correlation-id") or request_id

        xff = headers.get("x-forwarded-for")
        ip = (xff.split(",")[0].strip() if xff else None) \
            or headers.get("x-real-ip") \
            or headers.get("cf-connecting-ip") \
            or headers.get("true-client-ip")
        client = scope.get("client")
        if not ip and isinstance(client, (list, tuple)) and client:
            ip = client[0]

        user_agent = headers.get("user-agent") \
                    or headers.get("sec-ch-ua-full-version-list") \
                    or headers.get("sec-ch-ua")

        state = scope.setdefault("state", {})
        state["request_id"] = request_id
        state["correlation_id"] = correlation_id
        state["ip"] = ip
        state["user_agent"] = user_agent

        if not state.get("user_id"):
            uid, uname, role = self._load_user_for_mw(headers)
            if uid:
                state["user_id"] = uid
                state["username"] = uname
                state["role"] = role

        status_holder = {"code": None}

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                status_holder["code"] = message["status"]

                hdrs = list(message.get("headers", []))
                hdrs.append((b"x-request-id", request_id.encode()))
                hdrs.append((b"x-correlation-id", correlation_id.encode()))

                err_code = state.get("audit_error_code")
                if status_holder["code"] and status_holder["code"] >= 400 and err_code:
                    hdrs.append((b"x-error-code", str(err_code).encode()))

                message["headers"] = hdrs
            await send(message)

        token_var = audit_changes_buffer.set([])

        started = time.perf_counter()
        error_msg: Optional[str] = None

        try:
            await self.app(scope, receive, send_wrapper)
        except Exception as exc:
            status_holder["code"] = status_holder["code"] or 500
            error_msg = str(exc)
            raise
        finally:
            state = scope.setdefault("state", {})
            user_id = state.get("user_id")
            actor_label = state.get("username")
            actor_kind = ActorKind.user

            status_code = status_holder["code"] or 200
            if state.get("audit_status_code"):
                status_code = state["audit_status_code"]
            if not error_msg:
                error_msg = state.get("audit_error_message")

            duration_ms = round((time.perf_counter() - started) * 1000)

            target_type, target_id = self._guess_target(path, root_path)
            action = f"{method.upper()} {root_path}{path}" if root_path else f"{method.upper()} {path}"

            status = (
                AuditStatus.success if status_code < 400 and not error_msg
                else (AuditStatus.failed if status_code >= 500 or error_msg else AuditStatus.warning)
            )

            context_common = {
                "status_code": status_code,
                "ip": ip,
                "user_agent": user_agent,
                "duration_ms": duration_ms,
                "query_string": scope.get("query_string", b"").decode() or None,
                "request_id": request_id,
                "correlation_id": correlation_id,
                "error_code": state.get("audit_error_code"),
            }

            try:
                with self.db_session_factory() as db:
                    write_audit(
                        db,
                        actor_kind=actor_kind,
                        user_id=user_id,
                        actor_label=actor_label,
                        action=action,
                        status=status,
                        target_type=target_type,
                        target_id=target_id,
                        message=error_msg,
                        request_id=request_id,
                        correlation_id=correlation_id,
                        ip=ip,
                        user_agent=user_agent,
                        context=context_common,
                    )
            except Exception:
                pass

            try:
                changes_buffer = audit_changes_buffer.get() or []
            finally:
                audit_changes_buffer.reset(token_var)

            if changes_buffer:
                try:
                    with self.db_session_factory() as db:
                        for item in changes_buffer:
                            op    = item["op"]
                            ttype = item["type"]
                            tid   = item["id"]
                            chg   = item["changes"]

                            write_audit(
                                db,
                                actor_kind=actor_kind,
                                user_id=user_id,
                                actor_label=actor_label,
                                action=f"{op} {ttype}",
                                status=AuditStatus.info,
                                target_type=ttype,
                                target_id=str(tid) if tid is not None else None,
                                message=None,
                                request_id=request_id,
                                correlation_id=correlation_id,
                                ip=ip,
                                user_agent=user_agent,
                                context={"via": action, **context_common},
                                changes=chg,
                            )
                except Exception:
                    pass

    def _load_user_for_mw(self, headers: dict) -> tuple[str|None, str|None, str|None]:
        auth = headers.get("authorization")
        if not auth or not auth.lower().startswith("bearer "):
            return None, None, None
        token = auth.split(" ", 1)[1].strip()
        try:
            with self.db_session_factory() as db:
                user = load_user_from_token(token, db)
                uid = str(user.id)
                uname = getattr(user, "username", None) or getattr(user, "name", None) or "anonymous"
                role = getattr(user, "role", None)
                return uid, uname, role
        except Exception:
            return None, None, None
