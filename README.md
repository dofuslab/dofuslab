![DofusLab](dofuslab-logo.png?raw=true 'DofusLab')

DofusLab is an open source set builder for players of the French MMO [Dofus](https://www.dofus.com/), where you can experiment with your equipment.

Written using [TypeScript](https://www.typescriptlang.org/) and Python 3.

Please come give us a try at https://dofuslab.io!

---

<details><summary><b>Project setup (manual)</b></summary>
<p>

## Initial

#### Setup testing URL and env files

```bash
$ sudo echo '127.0.0.1       dev.localhost' >> /etc/hosts
$ cp client/.env.dist client/.env && cp server/.env.dist server/.env
```

## Backend

#### Start postgres and redis

```bash
$ postgres -D /usr/local/var/postgres
$ redis-server
```

#### Alternative: Start postgres and redis with [Homebrew](https://github.com/Homebrew/brew)

```bash
$ brew services start postgresql; brew services start redis
```

#### Create database

```bash
$ psql
$ CREATE DATABASE dofuslab;
$ \c dofuslab
$ CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
$ exit
```

Replace `[USER]` with your postgres username.

```bash
$ sed -i '' 's/postgres:password/[USER]:password/g' server/.env
```

#### Start a virtual environment

```bash
$ python3 -m venv venv
$ source venv/bin/activate
```

#### Install dependencies

```bash
$ cd server
$ pip install -r requirements.txt
```

#### Fill database with initial content

```bash
flask db upgrade
python -m oneoff.database_setup
python -m oneoff.update_image_urls
```

#### Run the server

```bash
$ flask run
```

## Frontend

#### Install root dependencies

```bash
$ yarn
```

#### Install dependencies

```bash
$ cd client
$ yarn
```

#### Run the app

```bash
$ yarn dev
```

Open http://dev.localhost:3000/ and test away!

</p>
</details>

---

<details><summary><b>Project setup (docker)</b></summary>
<p>

## Installing software

To get started, you'll need to install [Docker Desktop](https://www.docker.com/products/docker-desktop/), and optionally [Tilt](https://docs.tilt.dev/install.html). Tilt is being [integrated into Docker Compose](https://www.docker.com/blog/docker-compose-experiment-sync-files-and-automatically-rebuild-services-with-watch-mode/) and it may not be necessary to set it up independently in the future. It also adds additional complexity to your environment, and should only be used once you've confirmed the vanilla Docker Compose build is working.

Note that you may need to configure your git client to check out "as-is" to avoid converting scripts to CRLF, which will result in errors like:

```bash
dofuslab@ac1658cacb7a:~/oneoff$ ./setup_db.sh
bash: ./setup_db.sh: /bin/sh^M: bad interpreter: No such file or directory
```

## Running the development environment (Docker Compose)

Once you have Docker Desktop installed you can run the DofusLab environment by opening a terminal to the project directory and running:

```bash
$ docker compose build
$ docker compose up -d
```

This should result in something that looks like this, after the build completes and the containers start:

```bash
[+] Running 5/5
 ✔ Container dofuslab-postgres-1  Running
 ✔ Container dofuslab-redis-1     Running
 ✔ Container dofuslab-server-1    Started
 ✔ Container dofuslab-client-1    Started
 ✔ Container dofuslab-nginx-1     Started
```

## Running the development environment (Tilt)

Once you have Docker Desktop and Tilt installed, you can run the DofusLab environment by opening a terminal to the project directory, and running:

```bash
$ tilt up
```

This should result in some messages that look like:

```bash
$ tilt up
Tilt started on http://localhost:10350/
v0.30.7, built 2022-08-12

(space) to open the browser
(s) to stream logs (--stream=true)
(t) to open legacy terminal mode (--legacy=true)
(ctrl-c) to exit
```

At this point, you can press the spacebar to open Tilt in the browser to see service status and logs (or `s` to stream logs, etc). Dofuslab should now be building, and doing most of the steps in the manual setup section automatically.

It'll probably take a few minutes to build the containers the first time, due to how big the client and server containers are.

## Populate database

Once you have the Docker Compose/Tilt environment running, you need to get the database populated.

You can do this several ways. You can either run:

```bash
$ docker compose exec server /home/dofuslab/oneoff/setup_db.sh
```

Note that re-running this action can create duplicate items in the database, so just running it once is recommended. If you mess up your database, it's simple to reinitialize it. The simplest way is to bring your environment down (`docker compose down` or `tilt down` depending on how you're running things), and remove the postgres volume:

```bash
$ docker volume rm dofuslab_pgdata
```

Once you have your database populated, you should be able to access your development Dofuslab instance at http://host.docker.internal:8080/.

</p>
</details>

---

<details><summary><b>Making changes (manual)</b></summary>
<p>


## Update database schema

After making changes to the database schema (e.g. `server/app/database/model_*.py`) generate a new migration.

```bash
$ cd server
$ flask db migrate
```

Check the newly generated migration and make any necessary changes with your preferred text editor (vim, nano, emacs, [Visual Studio Code](https://code.visualstudio.com/docs/editor/command-line), etc)

```bash
$ vim server/app/migrations/versions/[SOME_HASH].py
```

Apply your new migration.

```bash
$ flask db upgrade
```

## Generate TypeScript types from GraphQL schema

After making any changes to GraphQL queries or mutations (`client/graphql/*`), or the GraphQL schema (`server/app/schema.py`), generate TypeScript types.

```bash
$ cd client/
$ yarn apollo-codegen
```

## i18n

To add any new user-facing strings client-side, add the key in the EN locale files first (`/client/public/static/locales/en/*`).

#### Merge the new key into the other locales

```bash
$ cd client/
$ yarn sync-i18n
```

When adding any user-facing strings in the backend, update all the `messages.po` files with the new strings.

```bash
$ cd server/
$ make update-translations
```

Check the translations and make any necessary changes with your preferred text editor, then compile the translations.

```bash
$ make compile-translations
```

## Add server-side dependencies (pip install)

Run `make freeze` to update requirements.txt (https://stackoverflow.com/questions/39577984/what-is-pkg-resources-0-0-0-in-output-of-pip-freeze-command)

## Adding new items

After all changes to the .json files inside `server/app/database/data` are made, it will be necessary to sync the database in order to include them.

```bash
$ cd server
$ python -m oneoff.sync_item
```

</p>
</details>

---

<details><summary><b>Making changes (Tilt)</b></summary>
<p>

For most things, Tilt should automatically update when files are changed. If things don't update correctly, you can `docker compose exec` scripts on the appropriate containers to update things. For instance:
```bash
$ cd server
$ flask db migrate
```
...becomes:
```bash
$ docker compose exec server flask db migrate
```

That said, these updates should (for the most part) happen automatically!

As of time of this writing, it will be necessary to sync items (and such) to the database when changes are made to those json files. I recommend having a shell opened in the server container:

```bash
$ docker compose exec -it server /bin/bash
```

...and following the sync instructions in the "manual" section. For example:

```bash
$ python -m oneoff.sync_item
```

</p>
</details>

[Join us on Discord](https://discord.gg/S4TvSfa) | [Buy us a coffee](https://www.buymeacoffee.com/dofuslab)
