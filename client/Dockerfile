FROM node:erbium-buster

ENV GRAPHQL_URI="http://localhost:5501/api/graphql"

ADD . /dofuslab-client

RUN yarn
WORKDIR /dofuslab-client
RUN yarn

CMD yarn dev