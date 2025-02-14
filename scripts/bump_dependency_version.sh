#!/bin/bash

dependency=""
dependencyVersion=""

for val in "$@"; do
  echo "$val"
  if [[ $val == "dependency="* ]]; then
    dependency="${val#"dependency="}"
  elif [[ $val == "version="* ]]; then
    dependencyVersion="${val#"version="}"
  fi
done

npm pkg set dependencies["$dependency"]="$dependencyVersion"

if ! [[ -z $(git status -s) ]]
then
  echo "package.json is changed"
  git add ./package.json
  git commit -m "Update $dependency to $dependencyVersion" --no-verify
  git push
fi
