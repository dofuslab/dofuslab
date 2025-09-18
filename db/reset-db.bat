docker compose exec postgres psql -U postgres -c "DROP DATABASE dofuslab WITH (FORCE);"
docker compose exec postgres psql -U postgres -c "CREATE DATABASE dofuslab;"
docker compose exec postgres /docker-entrypoint-initdb.d/01-init-psql.sh
docker compose exec server /home/dofuslab/oneoff/setup_db.sh
