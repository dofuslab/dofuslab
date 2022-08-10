FROM node:16-alpine

# RUN useradd -m -s /bin/bash dofuslab
# Alpine specific:
# https://wiki.alpinelinux.org/wiki/Setting_up_a_new_user
RUN addgroup -S dofuslab && adduser -h /home/dofuslab -S dofuslab -G dofuslab
USER dofuslab
WORKDIR /home/dofuslab

# Default value; will be overridden by build_args, if passed
ARG node_env=production
ENV NODE_ENV $node_env

ADD package.json .
ADD yarn.lock .
RUN yarn

COPY --chown=dofuslab:dofuslab . .
COPY --chown=dofuslab:dofuslab .env.docker .env

CMD yarn dev-docker
