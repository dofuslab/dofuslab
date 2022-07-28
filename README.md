![DofusLab](dofuslab-logo.png?raw=true 'DofusLab')

DofusLab is an open source set builder for players of the French MMO [Dofus](https://www.dofus.com/), where you can experiment with your equipment.

Written using [TypeScript](https://www.typescriptlang.org/) and Python 3.

Please come give us a try at https://dofuslab.io!

---

<details><summary><b>Project setup</b></summary>
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

<details><summary><b>Making changes</b></summary>
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

[Join us on Discord](https://discord.gg/S4TvSfa) | [Buy us a coffee](https://www.buymeacoffee.com/dofuslab)
