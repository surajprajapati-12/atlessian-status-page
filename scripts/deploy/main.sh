#!/bin/bash

# Make environment variables available based on $MICROS_ENV
# shellcheck source=/dev/null
source "${BASH_SOURCE%/*}/env-setup.sh"

set -o errexit
set -o pipefail
set -o nounset

main() {
    if [ "$#" -ne 1 ]; then
        echo "Failed! Please provide a deployment command (\`yarn deploy [provision, publish]\`)"
        exit 1
    fi

    if ! atlas micros service show --service "$SERVICE_NAME"; then
        echo "Failed! \"$SERVICE_NAME\" doesn't appear to exist"
        exit 1
    fi

    local descriptor="./infrastructure.sd.yml"
    if [ ! -f "$descriptor" ]; then
        echo "Failed! Service descriptor ($1) doesn't seem to exist"
        exit 1
    fi

    case "$1" in
        "provision")
            atlas micros service deploy \
                --service "$SERVICE_NAME" \
                --env $MICROS_ENV \
                --mode cutover \
                --file "$descriptor"
            ;;
        "publish")
            atlas plugin install -n bifrost
            atlas bifrost upload \
                --service "$SERVICE_NAME" \
                --env $BIFROST_DEPLOY_ENV \
                --version "$MONOREPO_COMMIT" \
                --dir ./dist

            atlas bifrost release \
                --service "$SERVICE_NAME" \
                --env $BIFROST_DEPLOY_ENV \
                --version "$MONOREPO_COMMIT" \
                --track main \
                --mode cutover \
                --cutover-spinnaker-enabled
            ;;
        *)
            echo "Failed! \"$1\" isn't a valid deployment command ([provision, publish])"
            exit 1
    esac
}

pushd "$(dirname "$0")/../.."
main $@
popd

