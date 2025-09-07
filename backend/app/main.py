from fastapi import FastAPI, Request
from app.api import mailer
from app.api import job
from app.api import webhooks
from app.api import stats
from app.api import template
from app.api import me
from app.api import users
from app.api import logs
from app.api import settings_logo
from app.api import settings_template_source
from app.api import dashboard
from app.routers import umami
from app.routers import auth


from fastapi.middleware.cors import CORSMiddleware
from app.utils.responses import send_status_response

app = FastAPI(root_path='/api')

from sqlalchemy.orm import sessionmaker
from app.database import engine
from app.audit.audit_api_middleware import AuditMiddleware

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
app.add_middleware(
    AuditMiddleware, 
    db_session_factory=SessionLocal,
    exclude_prefixes=("/api/docs", "/api/openapi.json", "/api/health", "/api/metrics")
)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(me.router)
app.include_router(users.router)
app.include_router(stats.router)
app.include_router(mailer.router)
app.include_router(umami.router)
app.include_router(job.router)
app.include_router(webhooks.router)
app.include_router(template.router)
app.include_router(logs.router)
app.include_router(dashboard.router)

app.include_router(settings_logo.router)
app.include_router(settings_template_source.router)

@app.get("/")
def root():
    return {
        "code": "OK",
        "message": "API is healthy and running.",
        "status": 200,
        "detail": "The UmamiSender API root endpoint responded successfully."
    }




from sqlalchemy.exc import IntegrityError, DataError, SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError

@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    error_mapping = {
        404: {"code": "NOT_FOUND", "message": "The requested resource was not found."},
        403: {"code": "FORBIDDEN", "message": "Access is forbidden."},
        401: {"code": "UNAUTHORIZED", "message": "Unauthorized access."},
        500: {"code": "INTERNAL_ERROR", "message": "An internal server error occurred."},
        400: {"code": "BAD_REQUEST", "message": "The request is invalid."},
    }
    error = error_mapping.get(exc.status_code, {"code": "HTTP_ERROR", "message": "An unknown HTTP error occurred."})

    request.state.audit_error_message = str(exc.detail)
    request.state.audit_status_code = exc.status_code
    request.state.audit_error_code = error["code"]

    return send_status_response(
        code=error["code"],
        message=error["message"],
        status=exc.status_code,
        detail=str(exc.detail)
    )

@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    detail = str(getattr(exc, "orig", exc))
    request.state.audit_error_message = detail
    request.state.audit_status_code = 409
    request.state.audit_error_code = "INTEGRITY_ERROR"

    return send_status_response(
        code="INTEGRITY_ERROR",
        message="A database integrity constraint was violated.",
        status=409,
        detail=detail
    )

@app.exception_handler(DataError)
async def data_error_handler(request: Request, exc: DataError):
    detail = str(getattr(exc, "orig", exc))
    request.state.audit_error_message = detail
    request.state.audit_status_code = 400
    request.state.audit_error_code = "DATA_ERROR"

    return send_status_response(
        code="DATA_ERROR",
        message="The provided data has an invalid format or value.",
        status=400,
        detail=detail
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError):
    request.state.audit_error_message = str(exc)
    request.state.audit_status_code = 500
    request.state.audit_error_code = "DATABASE_ERROR"

    return send_status_response(
        code="DATABASE_ERROR",
        message="An unexpected database error occurred.",
        status=500,
        detail=str(exc)
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    first_error = exc.errors()[0] if exc.errors() else {}
    message = first_error.get("msg", "Invalid request")
    detail = first_error.get("ctx", {}).get("reason", message)
    location = ".".join(str(loc) for loc in first_error.get("loc", []))

    request.state.audit_error_message = f"{message} at {location}"
    request.state.audit_status_code = 400
    request.state.audit_error_code = "INVALID_INPUT"

    return send_status_response(
        code="INVALID_INPUT",
        message=message,
        status=400,
        detail=str(detail) + f" at {location}"
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    request.state.audit_error_message = str(exc)
    request.state.audit_status_code = 500
    request.state.audit_error_code = "UNHANDLED_ERROR"
    return send_status_response(
        code="UNHANDLED_ERROR",
        message="Unhandled server error.",
        status=500,
        detail=str(exc),
    )
