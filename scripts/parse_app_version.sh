#!/bin/bash

SRCROOT="${SRCROOT:=./scripts}"
echo "$SRCROOT/../package.json"

# Read major, minor, and buildNumber from package.json
version=$(grep -w 'version":' $SRCROOT/../package.json | cut -d '"' -f4| cut -f1 -d"-" | head -n 1)
versionBuildNumber=$(grep -w 'buildNumber":' $SRCROOT/../package.json | cut -d '"' -f4| cut -f1 -d"-" | head -n 1)

echo "version: $version"
echo "versionBuildNumber: $versionBuildNumber"

# Extract major, minor from version
majorVersion=$(echo $version | cut -d'.' -f1)
minorVersion=$(echo $version | cut -d'.' -f2)

# Format minor and versionBuildNumber
formattedMinorVersion=$([ $minorVersion -gt 9 ] && echo "$minorVersion" || echo "0$minorVersion")
formattedVersionBuildNumber=$([ $versionBuildNumber -gt 9 ] && echo "$versionBuildNumber" || echo "0$versionBuildNumber")

# Calculate buildNumber
buildNumber="${majorVersion}${formattedMinorVersion}${formattedVersionBuildNumber}"

echo "buildNumber: $buildNumber"
