FROM node:erbium-buster

ADD . /dofuslab-client

ENV GRAPHQL_URI="http://localhost:5501/api/graphql"

RUN sed -i 's/localhost:5000/server:5501/g' /dofuslab-client/package.json

RUN yarn
WORKDIR /dofuslab-client
RUN yarn

CMD yarn dev