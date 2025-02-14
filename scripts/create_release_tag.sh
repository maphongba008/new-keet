#!/bin/bash

source ./scripts/parse_app_version.sh

tag="${version}-${buildNumber}"
tagMessage="Release v${version}-${buildNumber}"

echo "tag: $tag"
echo "tagMessage: $tagMessage"

git tag -a "${version}-${buildNumber}" -m "Release v${appVersion}-${buildNumber}"
git push --follow-tags
