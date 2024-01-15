#!/bin/sh

set -x
set -e

docker compose build
docker compose up -d server
docker compose stop -t 0 postgres
docker compose rm -f postgres
docker volume rm dofuslab_pgdata
docker compose up -d
sleep 5
docker compose exec -it server /home/dofuslab/oneoff/setup_db.sh
