#!/bin/bash

set -eux

REPO=${1-openecoe/webui-ng}
RELEASE=${2-$(date '+%Y-%m-%d')}

docker build --no-cache -t $REPO:$RELEASE .

for tag in ${@:3}
do docker tag $REPO:$RELEASE $REPO:$tag-$RELEASE
done

