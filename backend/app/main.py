from fastapi import FastAPI
from app.api import mailer
from app.api import job
from app.api import webhooks
from app.api import stats
from app.api import template
from app.routers import umami
from fastapi.middleware.cors import CORSMiddleware
from app.utils.responses import send_status_response

app = FastAPI(root_path='/api')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stats.router)
app.include_router(mailer.router)
app.include_router(umami.router)
app.include_router(job.router)
app.include_router(webhooks.router)
app.include_router(template.router)

@app.get("/")
def root():
    return send_status_response(
        code="OK",
        message="API is healthy and running.",
        status=200,
        detail="The UmamiSender API root endpoint responded successfully."
    )


from fastapi import FastAPI, Request
from sqlalchemy.exc import IntegrityError, DataError, SQLAlchemyError

@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    return send_status_response(
        code="INTEGRITY_ERROR",
        message="A database integrity constraint was violated.",
        status=400,
        detail=str(exc.orig)
    )

@app.exception_handler(DataError)
async def data_error_handler(request: Request, exc: DataError):
    return send_status_response(
        code="DATA_ERROR",
        message="The provided data has an invalid format or value.",
        status=400,
        detail=str(exc.orig)
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError):
    return send_status_response(
        code="DATABASE_ERROR",
        message="An unexpected database error occurred.",
        status=500,
        detail=str(exc)
    )