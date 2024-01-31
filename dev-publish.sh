#!/bin/bash

SSH_KEY_PATH=$HOME/Documents/projects/political-dilemma/dev_politicaldilemma.pem
REMOTE_HOST=13.39.48.132
REMOTE_PATH=/opt/dev-dilemma
REMOTE_USER=ubuntu
FORCE=$1;

# If the FORCE argument is not passed or not equal to "-f"
# check the current branch and not trasfer the files if
# it is not master
# if [ -z "$FORCE" ] || [ $FORCE != "-f" ] ; then
#     BRANCH="$(git rev-parse --abbrev-ref HEAD)"
#     if [[ "$BRANCH" != "master" ]]; then
#         echo "Aborting: you are not in the master branch (current $BRANCH)";
#         exit 1;
#     fi
# fi

echo  $SSH_KEY_PATH

# Check ssh private key existence
if [[ ! -f $SSH_KEY_PATH ]] ; then
    echo "Aborting: private ssh key not found!"
    exit 1;
fi

# Send file to remote location
rsync -vh \
      -e "ssh -i $SSH_KEY_PATH" \
      -r $PWD/ \
      --exclude=node_modules --exclude=logs --exclude=docs --exclude=.prettierrc --exclude=.git --exclude=.vscode \
      --exclude=.env --exclude=.editorconfig --exclude=.eslintrc.cjs --exclude=.nyc_output --exclude=pd-stack \
      --exclude=dev-publish.sh \
      --delete \
      --filter "protect .env" \
      $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH

# Install dependencies and restart application process
# ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH; npm install; pm2 restart ecosystem-dev.config.cjs; pm2 save"