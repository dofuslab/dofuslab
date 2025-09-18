FROM node:22-alpine

# RUN useradd -m -s /bin/bash dofuslab
# Alpine specific:
# https://wiki.alpinelinux.org/wiki/Setting_up_a_new_user
RUN addgroup -S dofuslab && adduser -h /home/dofuslab -S dofuslab -G dofuslab
USER dofuslab
WORKDIR /home/dofuslab

ADD package.json .
ADD yarn.lock .

COPY --chown=dofuslab:dofuslab . .
COPY --chown=dofuslab:dofuslab .env.docker .env

# Default value; will be overridden by build_args, if passed
# ARG node_env=production
ARG node_env=development
ENV NODE_ENV=$node_env

# Expose debug ports
EXPOSE 9229 9230

RUN yarn

CMD ["yarn", "dev-docker"]
# Useful if you just want the container to start and wait while you exec into it:
# CMD /bin/sh -c -- "while true; do sleep 30; done;"
