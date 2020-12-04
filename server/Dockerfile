# For more information, please refer to https://aka.ms/vscode-docker-python
FROM python:3.8-slim-buster

EXPOSE 5501

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# This should be in entrypoint.sh
ENV PGPASSWORD="do-not-use-in-production"

# "pg_config executable not found" solved
RUN apt-get -y update
RUN apt-get -y install gcc libpq-dev postgresql-client

# Install pip requirements
ADD requirements.txt .
RUN python -m pip install -r requirements.txt

# Add docker env config
ADD . /dofuslab-server
COPY .env.docker .env
COPY entrypoint.sh .

# Switching to a non-root user, please refer to https://aka.ms/vscode-docker-python-user-rights
RUN useradd appuser && chown -R appuser /dofuslab-server
USER appuser

ENTRYPOINT ["./entrypoint.sh"]