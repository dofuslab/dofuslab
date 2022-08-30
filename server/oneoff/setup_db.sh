#!/bin/sh
# set -e
set -x

flask db upgrade
python -m oneoff.database_setup << EOF
y
EOF
python -m oneoff.update_image_urls
