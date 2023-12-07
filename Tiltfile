# Welcome to Tilt!

docker_compose('./docker-compose.yml')

# Build Docker image
#   Tilt will automatically associate image builds with the resource(s)
#   that reference them (e.g. via Kubernetes or Docker Compose YAML).
#
#   More info: https://docs.tilt.dev/api.html#api.docker_build
docker_build(
    'dofuslab_client',
    './client',
    build_args={'node_env': 'development'},
    live_update = [
        sync('./client/.env.docker', '/home/dofuslab/.env'),
        sync('./client', '/home/dofuslab'),
        run('cd /home/dofuslab && yarn install', trigger=['./client/package.json', './client/yarn.lock']),
        run('cd /home/dofuslab && yarn sync-i18n', trigger='/client/public/locales/en/'),
        # we might need to be slower on this one:
        run('cd /home/dofuslab && yarn apollo-codegen-docker', trigger=['./server/app/schema.py', './client/graphql/']),
        restart_container()
    ]
)

docker_build(
    'dofuslab_server',
    './server',
    build_args = {'flask_env': 'development'},
    live_update = [
        sync('./server/.env.docker', '/home/dofuslab/.env'),
        sync('./server', '/home/dofuslab'),
        run('cd /home/dofuslab && pip install -r requirements.txt',
            trigger='./server/requirements.txt'),
        run('cd /home/dofuslab && flask db migrate', trigger='./server/app/database/model_*.py'),
        run('cd /home/dofuslab && make update-translations && make compile-translations',
            trigger=['./server/app/translations/es/LC_MESSAGES/messages.po',
                     './server/app/translations/fr/LC_MESSAGES/messages.po',
                     './server/app/translations/de/LC_MESSAGES/messages.po',
                     './server/app/translations/it/LC_MESSAGES/messages.po',
                     './server/app/translations/pt/LC_MESSAGES/messages.po']),
        # info on database live update triggers:
        # https://discord.com/channels/644349465859325972/705459723608260649/1006971343767609404
        # per Germy:
        # sync_buff => buffs.json
        # sync_class => spells.json, buffs.json
        # sync_custom_set_tag => custom_set_tags.json
        # sync_item => items.json, pets.json, weapons.json, mounts.json, rhineetles.json
        # sync_item_type => item_types.json
        # sync_set => sets.json
        # sync_spell => spells.json
        # run('python -m /home/dofuslab/oneoff/sync_buff', trigger='./app/database/data/buffs.json'),
        # run('python -m /home/dofuslab/oneoff/sync_class', trigger=['./app/database/data/buffs.json', './app/database/data/spells.json']),
        # run('python -m /home/dofuslab/oneoff/sync_custom_set_tag', trigger='./app/database/data/custom_set_tags.json'),
        # run('python -m /home/dofuslab/oneoff/sync_item', trigger=['./app/database/data/items.json', './app/database/data/pets.json', './app/database/data/weapons.json', './app/database/data/mounts.json', './app/database/data/rhineetles.json']),
        # run('python -m /home/dofuslab/oneoff/sync_item_type', trigger='./app/database/data/item_types.json'),
        # run('python -m /home/dofuslab/oneoff/sync_set', trigger='./app/database/data/sets.json'),
        # run('python -m /home/dofuslab/oneoff/sync_spell', trigger='./app/database/data/spells.json'),
        # we don't really need to restart the container for most of these, so it might make more sense to have local_resources down below?
        restart_container(),
    ],
)


dc_resource('redis', labels=["database"])
dc_resource('postgres', labels=["database"])
dc_resource('server', labels=["server"], links = ["http://dev.localhost:5000/api/graphql"])
dc_resource('client', labels=["client"], links = ["http://dev.localhost:3000/"])

local_resource("setup-db", cmd="./db/reset-db.sh", cmd_bat="cd db && reset-db.bat", auto_init=False, labels=['utilities'], trigger_mode=TRIGGER_MODE_MANUAL)

# Run local commands
#   Local commands can be helpful for one-time tasks like installing
#   project prerequisites. They can also manage long-lived processes
#   for non-containerized services or dependencies.
#
#   More info: https://docs.tilt.dev/local_resource.html
#
# local_resource('install-helm',
#                cmd='which helm > /dev/null || brew install helm',
#                # `cmd_bat`, when present, is used instead of `cmd` on Windows.
#                cmd_bat=[
#                    'powershell.exe',
#                    '-Noninteractive',
#                    '-Command',
#                    '& {if (!(Get-Command helm -ErrorAction SilentlyContinue)) {scoop install helm}}'
#                ]
# )


# Extensions are open-source, pre-packaged functions that extend Tilt
#
#   More info: https://github.com/tilt-dev/tilt-extensions
#
load('ext://git_resource', 'git_checkout')

# Organize logic into functions
#   Tiltfiles are written in Starlark, a Python-inspired language, so
#   you can use functions, conditionals, loops, and more.
#
#   More info: https://docs.tilt.dev/tiltfile_concepts.html
#
