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
        run('cd /app && yarn install', trigger=['./package.json', './yarn.lock']),
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
            trigger='./requirements.txt'),
        restart_container(),
    ],
)

# local_resource('db_setup', cmd='bash server/setup_db.sh')

dc_resource('redis', labels=["database"])
dc_resource('postgres', labels=["database"])
dc_resource('server', labels=["server"])
dc_resource('client', labels=["client"])

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
