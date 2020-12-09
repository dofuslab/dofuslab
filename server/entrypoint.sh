#!/usr/bin/env bash

psql -v ON_ERROR_STOP=1 --host "postgres" --username "dofuslab" --dbname "dofuslab" <<-EOSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

EOSQL

flask db upgrade
cd dofuslab-server
printf 'y\n' | python -m oneoff.database_setup
printf 'y\n' | python -m oneoff.update_image_urls