from fastapi.responses import JSONResponse

def send_status_response(code: str, message: str, status: int, detail: str = "") -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={
            "error": {
                "code": code,
                "message": message,
                "status": status,
                "detail": detail
            }
        }
    )
