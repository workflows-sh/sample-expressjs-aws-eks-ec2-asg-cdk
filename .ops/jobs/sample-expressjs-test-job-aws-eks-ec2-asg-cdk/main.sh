#!/bin/bash

    set -euo pipefail
    IFS=$'
	'

    touch ~/.bashrc
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
. ~/.bashrc
nvm install $NODE_VERSION
nvm alias default $NODE_VERSION
nvm use default
node --version
git clone https://oauth2:$GITHUB_TOKEN@github.com/$ORG/$REPO
cd $REPO && ls -asl
git fetch && git checkout $REF
npm i
npm run test
    