#!/bin/bash

if [ -z "$2" ]; then
    echo "Usage: build.sh <tarball path> <docker label>"
    exit 1
fi

TARBALL_PATH=$1
DOCKER_TAG=$2

CURDIR=$(pwd)
TEMPDIR=$(mktemp -d /tmp/wheelhouse-XXXXX)
trap 'rm -rf "$TEMPDIR"' EXIT QUIT
(
    cd $TEMPDIR

    cp $CURDIR/deploy/Dockerfile .
    cp $CURDIR/$TARBALL_PATH package.tbz

    docker build -t $DOCKER_TAG .
    # docker push $DOCKER_TAG
)
