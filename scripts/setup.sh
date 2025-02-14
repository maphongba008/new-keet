#!/bin/bash
answer="$1"
while [[ ! $answer =~ ^(android|a|ios|i|q)$ ]]
do
  echo "which platform to build? a(android)/i(ios)"
  read answer
done

BOLD="\033[1m"
RESET="\033[0m"

# fresh install npm modules
rm -Rf node_modules
npm install --ignore-scripts=false
# npm ci

changes=$(git status --porcelain ./package-lock.json)

if [ "${changes}" ]; then
  git commit -m "update package-lock.json" -o ./package-lock.json
fi

if [[ $answer = "q" ]]; then
  exit
elif [[ $answer = "ios" || $answer = "i" ]]; then
  rm -Rf ios/Pods ios/Podfile.lock
  npx pod-install
  echo "Run commands in separate process:"
  echo -e "${BOLD}npm run start:clean${RESET}"
  echo -e "${BOLD}npm run ios${RESET}"
elif [[ $answer = "android" || $answer = "a" ]]; then
  cd android
  ./gradlew clean
  ./gradlew assembleStoreDebug
  cd ..
  echo "Run commands in separate process:"
  echo -e "${BOLD}npm run start:clean${RESET}"
  echo -e "${BOLD}npm run android${RESET}"
fi
