#!/bin/sh
cd "$(dirname "$0")"
tmux split-window -h 'nodemon server.js'
tmux split-window -v 'cd app; yarn serve --port 4200'
tmux split-window -h 'portfwd 8080 25080'
