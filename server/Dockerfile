FROM python:3.8-bullseye
# note: this is based on bullseye (a debian based image) because alpine can take a long time to build python requirements: https://stackoverflow.com/a/49057289

# Default value; will be overridden by build-args, if passed
ARG flask_env=production
ENV FLASK_ENV $flask_env

# install packages required for installing python requirements
RUN apt-get update
RUN apt-get install -y libopenblas-dev python3-dev libffi-dev gcc gfortran python3-dev liblapack-dev libblis-dev

# install requirements:
RUN pip3 install --upgrade pip

WORKDIR /opt/dofuslab
COPY requirements.txt .

# install from our dofuslab requirements:
RUN pip3 install -r requirements.txt

# set up user to prevent sandbox escapes:
RUN useradd -m -s /bin/bash dofuslab
USER dofuslab

# copy over server files:
WORKDIR /home/dofuslab
ENV PYTHONPATH='/home/dofuslab/.local/bin'
COPY . .
COPY .env.docker .env

# should only be run once, perhaps in a separate init image
# RUN flask db upgrade
# RUN python -m oneoff.database_setup
# RUN python -m oneoff.update_image_urls

# run flask on all interfaces since otherwise publishing the port won't do anything:
CMD flask run --host=0.0.0.0