FROM python:3.11-slim

WORKDIR /worker

COPY ./backend/app /worker/app
COPY ./worker/tasks /worker/tasks
COPY ./worker/requirements.txt .

ENV PYTHONPATH=/worker:/worker/app
ENV CELERY_ROLE=worker

RUN pip install --no-cache-dir -r requirements.txt

CMD ["celery", "-A", "tasks.worker", "worker", "--loglevel=info"]