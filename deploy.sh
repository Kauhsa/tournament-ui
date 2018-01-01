#!/bin/bash

set -e

case $1 in
  "production")
    HEROKU_BACKEND=https://"$HEROKU_EMAIL":"$HEROKU_TOKEN"@git.heroku.com/tournament-ui-backend.git
    HEROKU_FRONTEND=https://"$HEROKU_EMAIL":"$HEROKU_TOKEN"@git.heroku.com/tournament-ui-frontend.git
    ;;
  *)
    echo "ERROR: No environment given, exiting!"
    exit 1
    ;;
esac

echo "Deploying backend"
git push --force "$HEROKU_BACKEND" $(git subtree split --prefix backend HEAD):refs/heads/master --quiet

echo "Deploying frontend"
git push --force "$HEROKU_FRONTEND" $(git subtree split --prefix frontend HEAD):refs/heads/master --quiet

echo "Done!"

