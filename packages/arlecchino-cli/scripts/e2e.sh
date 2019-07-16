#!/bin/sh

set -eux

BASE_DIR="packages/arlecchino-cli"

ARLECCHINO="node ${BASE_DIR}/built/cli.js"

$ARLECCHINO ${BASE_DIR}/examples/use-variables.yml
$ARLECCHINO ${BASE_DIR}/examples/file-upload.yml
$ARLECCHINO ${BASE_DIR}/examples/table.yml
$ARLECCHINO ${BASE_DIR}/examples/dialog.yml
$ARLECCHINO ${BASE_DIR}/examples/import-steps.yml
$ARLECCHINO ${BASE_DIR}/examples/escape-hatches.yml
