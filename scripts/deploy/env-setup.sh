#!/usr/bin/env bash

set -ex

# Injects the env specific variables per micros env.
case $MICROS_ENV in

  adev | ddev)
    # Bifrost deploy has case sensitive requirements for its environment
    export BIFROST_DEPLOY_ENV=ddev
    ;;

  *)
    ;;
esac
