FROM python:3.8-bullseye
# note: this is based on bullseye (a debian based image) because alpine can take a long time to build python requirements: https://stackoverflow.com/a/49057289

# Default value; will be overridden by build-args, if passed
ARG flask_env=production
ENV FLASK_ENV $flask_env

# install packages required for installing python requirements
RUN apt-get update
RUN apt-get install -y libopenblas-dev python3-dev libffi-dev gcc gfortran python3-dev liblapack-dev libblis-dev

# set up user to prevent sandbox escapes:
RUN useradd -m -U -s /bin/bash dofuslab
# https://manpages.debian.org/jessie/passwd/useradd.8.en.html
USER dofuslab
WORKDIR /home/dofuslab

# install requirements:
# RUN pip3 install --user --upgrade pip
COPY --chown=dofuslab:dofuslab requirements.txt .
# install from our dofuslab requirements:
RUN pip3 install --user -r requirements.txt
ENV PYTHONPATH='/home/dofuslab/.local/bin'
ENV PATH="${PATH}:/home/dofuslab/.local/bin"

# copy over server files:
COPY --chown=dofuslab:dofuslab . .
COPY --chown=dofuslab:dofuslab .env.docker .env

# run flask on all interfaces:
# CMD flask run --host=0.0.0.0
CMD ["flask", "run", "--host=0.0.0.0"]

