FROM node:erbium-buster

ADD . /dofuslab-client
COPY .env.docker .env

RUN sed -i 's/localhost:5000/server:5501/g' /dofuslab-client/package.json

RUN yarn
WORKDIR /dofuslab-client
RUN yarn

CMD yarn dev