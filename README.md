![DofusLab](dofuslab-logo.png?raw=true "DofusLab")

DofusLab is an open source set builder for players of the French MMO [Dofus](https://www.dofus.com/). It lets you experiment with your equipment.

Written in Javascript using [TypeScript](https://www.typescriptlang.org/) and Python 3.

Please come give us a try at https://dofuslab.io!

---

## Initial setup

```bash
# Setup testing URL and env files
$ sudo echo '127.0.0.1       dev.localhost' >> /etc/hosts
$ cp client/.env.dist client/.env && cp server/.env.dist server/.env
```

## Backend setup

```bash
# Start postgres and redis
$ postgres -D /usr/local/var/postgres
# DOES ANYONE KNOW HOW TO START REDIS WITHOUT BREW?

# WITH HOMEBREW https://github.com/Homebrew/brew
# Start postgres and redis
$ brew services start postgresql; brew services start redis

# Create database
$ psql
$ CREATE DATABASE dofuslab;
$ \c dofuslab
$ CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
$ exit

# Replace USER with your postgres username
$ sed -i '' 's/postgres:password/USER:password/g' server/.env

# Start a virtual environment
$ python3 -m venv venv
$ source venv/bin/activate

# Install dependencies
$ cd server
$ pip install -r requirements.txt

# Fill database with initial content
flask db upgrade
python -m oneoff.database_setup
python -m oneoff.update_image_urls

# Run the server
$ Flask run
```

## Frontend setup

```bash
# Install dependencies
$ cd client
$ yarn

# Run the app
$ yarn dev
```

Open http://dev.localhost:3000/ and test away!

---

[Join us on Discord](https://discord.gg/S4TvSfa) | [Buy us a coffee](https://www.buymeacoffee.com/dofuslab)