FROM node:16-alpine

# RUN useradd -m -s /bin/bash dofuslab
# Alpine specific:
# RUN addgroup -S dofuslab && adduser -S dofuslab -G dofuslab
# USER dofuslab

# Default value; will be overridden by build_args, if passed
ARG node_env=production
ENV NODE_ENV $node_env

WORKDIR /home/dofuslab

COPY . .
COPY .env.docker .env

RUN yarn

CMD yarn dev-docker