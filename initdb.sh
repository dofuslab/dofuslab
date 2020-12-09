#!/usr/bin/env bash

docker build --pull --rm -f "server\Dockerfile.initdb" -t dofuslab_init:latest "server"
docker run --network dofuslab_default --name dofuslab_init_1 dofuslab_init
docker stop dofuslab_init_1
docker rm dofuslab_init_1