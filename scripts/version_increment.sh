#!/bin/bash

source ./scripts/parse_app_version.sh

packageJson="package.json"

# Increment the versionCode by 1
((versionBuildNumber++))

npm pkg set buildNumber=$versionBuildNumber

# recalculate build number
source ./scripts/parse_app_version.sh

echo "Android VersionCode and iOS CFBundleVersion have been incremented to $buildNumber"

git add $packageJson
git commit -m "pump build version to $buildNumber" --no-verify

