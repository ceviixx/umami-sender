from fastapi import FastAPI
from app.api import senders
# from app.api import umami
from app.api import mailer
from app.api import webhooks
from app.api import stats
from app.api import statslog

from app.routers import umami

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(root_path='/api')


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # oder dein Frontend-Host
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stats.router)
app.include_router(statslog.router)
app.include_router(senders.router)
app.include_router(umami.router)
app.include_router(mailer.router)
app.include_router(webhooks.router)

@app.get("/")
def root():
    return {"message": "UmamiSender API is running"}




from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, DataError, SQLAlchemyError

@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    return JSONResponse(
        status_code=400,
        content={
            "detail": "Database integrity error",
            "error": str(exc.orig)
        }
    )

@app.exception_handler(DataError)
async def data_error_handler(request: Request, exc: DataError):
    return JSONResponse(
        status_code=400,
        content={
            "detail": "Invalid data format",
            "error": str(exc.orig)
        }
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Unhandled database error",
            "error": str(exc.orig)
        }
    )