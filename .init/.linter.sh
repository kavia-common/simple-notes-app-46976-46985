#!/bin/bash
cd /home/kavia/workspace/code-generation/simple-notes-app-46976-46985/notes_frontend
npm run lint
ESLINT_EXIT_CODE=$?
if [ $ESLINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

