#!/bin/bash

function bump {
	output=$(npm version ${release} --no-git-tag-version)
  source ./scripts/parse_app_version.sh

  if [[ "$release" == "major" || "$release" == "minor" ]]
  then
    npm pkg set buildNumber=0
  fi
}

function help {
	echo "Usage: $(basename $0) [<newversion> | major | minor | patch]"
}

if [ -z "$1" ] || [ "$1" = "help" ]; then
	help
  exit 1
fi

release=$1

if [ -d ".git" ]; then
	changes=$(git status --porcelain)
	echo "${changes}"

	if [ -z "${changes}" ]; then
    bump

		git add .

    git commit -m "Update app version v${version}" --no-verify
	else
		echo "Please commit staged files prior to bumping"
	fi
else
	bump
fi
