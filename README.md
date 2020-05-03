![DofusLab](dofuslab-logo.png?raw=true "DofusLab")

DofusLab is an open source set builder for players of the French MMO [Dofus](https://www.dofus.com/). It lets you experiment with your equipment.

Written in Javascript using [TypeScript](https://www.typescriptlang.org/) and Python 3.

Please come give us a try at https://dofuslab.io!

## Frontend setup

```bash
# Install dependencies
$ cd client
$ yarn

# Run the app
$ yarn dev
```

## Backend setup

```bash
# Start a virtual environment
$ python3 -m venv venv
$ source venv/bin/activate

# Install dependencies
$ cd server
$ pip install -r requirements.txt

# Setup database
# TODO - This whole setup will be overhauled with a Docker eventually

# Run the server
$ Flask run
```