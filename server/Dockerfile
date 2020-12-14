FROM python:3.8-alpine

EXPOSE 5501

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

### TODO: This should be in entrypoint.sh
ENV PGPASSWORD="do-not-use-in-production"

# "No working compiler found" solved
RUN apk add --no-cache --virtual .py_deps build-base python3-dev libffi-dev
# "pg_config executable not found" solved
RUN apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev
# "Error loading shared library libpq.so" solved
RUN apk add --no-cache --virtual .flask libpq

# Install pip requirements
ADD requirements.txt .
RUN python -m pip install -r requirements.txt

# Add docker env config
ADD . /dofuslab-server
COPY .env.docker .env

# Cleanup
#RUN apk --purge del .py_deps .build-deps .flask

# Switching to a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENTRYPOINT flask run --host=0.0.0.0 --port=5501