#!/bin/sh

set -eux

ARLECCHINO="node built/cli.js"

$ARLECCHINO examples/use-variables.yml
$ARLECCHINO examples/file-upload.yml
$ARLECCHINO examples/table.yml
$ARLECCHINO examples/dialog.yml
$ARLECCHINO examples/import-steps.yml
