#!/bin/bash

SSH_KEY_PATH=$HOME/Documents/projects/political-dilemma/dev_politicaldilemma.pem
REMOTE_HOST=13.39.48.132
REMOTE_PATH=/opt/dev-dilemma
REMOTE_USER=ubuntu

# Block if current branch is not develop
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$BRANCH" != "develop" ]]; then
    echo "Aborting: you are not in the master branch (current $BRANCH)";
    exit 1;
fi


# Check ssh private key existence
if [[ ! -f $SSH_KEY_PATH ]] ; then
    echo "Aborting: private ssh key not found!"
    exit 1;
fi

# Send file to remote location
rsync -avhz \
      -e "ssh -i $SSH_KEY_PATH" \
      -r $PWD/ \
      --exclude=node_modules --exclude=logs --exclude=docs --exclude=.prettierrc --exclude=.git --exclude=.vscode \
      --exclude=.env --exclude=.editorconfig --exclude=.eslintrc.cjs --exclude=.nyc_output --exclude=pd-stack \
      --exclude=dev-publish.sh \
      --delete \
      --filter "protect .env" \
      $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH

# Install dependencies and restart application process
ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
"export PATH=$PATH:/home/ubuntu/.nvm/versions/node/v20.11.0/bin; \
cd $REMOTE_PATH; npm ci; npm run applyMigrations; pm2 startOrRestart ecosystem-dev.config.cjs; pm2 save"