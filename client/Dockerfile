FROM node:erbium-buster

ENV GRAPHQL_URI="http://dev.localhost:5501/api/graphql"

ADD . /dofuslab-client

RUN sed -i 's/localhost:5000/server:5501/g' /dofuslab-client/package.json

RUN yarn
WORKDIR /dofuslab-client
RUN yarn

CMD yarn dev