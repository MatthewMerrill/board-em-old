#!/bin/sh
cd "$(dirname "$0")"
tmux new-session -d \
  -x 240 -y 200 \
  -s 'boardem-deploy' \
  "sh tmuxsetup.sh; bash"
