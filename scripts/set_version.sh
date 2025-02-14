#!/bin/bash

# (!)
UPSTREAM="upstream"
BRANCH="bigroom"
VERSION="2.0.0"
# /(!)

function quit {
  echo "Exiting, reason: $1"
  exit 1
}

# cd $DIR

if [[ -n $(git status --porcelain --ignore-submodules=dirty vendor) ]]; then
  quit "Working copy is not clean"
fi

IFS='-' read -a array <<< "$VERSION"
VERS=${array[0]}
SUBFIX=${array[1]}

echo ---- git checkout $BRANCH
git checkout $BRANCH
echo ---- git fetch --all
git fetch --all
echo --- git reset --hard $UPSTREAM/$BRANCH --
git reset --hard $UPSTREAM/$BRANCH --

echo "Set to" $VERS-$SUBFIX

echo "Updating npm package version..."
npm version $VERSION

echo "Updating android version..."
# Define the path to the build.gradle file
buildGradle="android/app/build.gradle"
sed -i "s/versionName \".*\"/versionName \"$VERSION\"/" $buildGradle

echo "Updating ios version..."
# Define the path to the Info.plist file
plistFile="ios/Keet/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $VERSION" $plistFile

./scripts/version_increment.sh

echo "Please check the working copy carefully to confirm pushing to $UPSTREAM/$BRANCH"
git diff
answer=""
while [[ ! $answer =~ ^(y|n)$ ]]
do
  echo "Ready? y/n"
  read answer
done

if [[ $answer = "n" ]]; then
  exit
fi

git add android/app/build.gradle ios/Keet/Info.plist
git commit -m "pump to $VERSION"
echo "pump version"
git push $UPSTREAM $BRANCH --no-verify
