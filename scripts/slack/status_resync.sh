#!/bin/bash

# BUILD STATUS:
# -2 - cancelled
# -1 - failed
#  0 - pending
#  1 - running
#  2 - success
#  * - skipped

auth_token=""
channel_id=""
ts=""
file_path=""
file_url=""
# success, failure, cancelled, or skipped
runner_status=""
# apk, apk_sv, aab, or ios
current_runner=""
next_runner=""

apk=""
apk_sv=""
aab=""
ios=""

for val in "$@"; do
  echo "$val"
  if [[ $val == "ts="* ]]; then
    ts="${val#"ts="}"
  elif [[ $val == "channel_id="* ]]; then
    channel_id="${val#"channel_id="}"
  elif [[ $val == "token="* ]]; then
    auth_token="${val#"token="}"
  elif [[ $val == "file_path="* ]]; then
    file_path="${val#"file_path="}"
  elif [[ $val == "runner_status="* ]]; then
    runner_status="${val#"runner_status="}"
  elif [[ $val == "current_runner="* ]]; then
    current_runner="${val#"current_runner="}"
  elif [[ $val == "next_runner="* ]]; then
    next_runner="${val#"next_runner="}"
  fi
done

source ./scripts/slack/status_get.sh token="$auth_token" channel_id="$channel_id" ts="$ts"

if [ -f $file_path ]; then
  source ./scripts/slack/upload_file.sh token="$auth_token" channel_id="$channel_id" ts="$ts" file_path="$file_path"
else
  echo "File $file_path does not exist."
fi

slack_params=()
case $runner_status in

  success)
    slack_params+=("${current_runner}=2 ${current_runner}_link=${file_url}")
    [ -n $next_runner ] && slack_params+=("${next_runner}=1")
    ;;

  failure)
    slack_params+=("${current_runner}=-1")
    [ -n $next_runner ] && slack_params+=("${next_runner}=1")
    ;;

  cancelled)
    slack_params+=("${current_runner}=-3")
   [ -n $next_runner ] && slack_params+=("${next_runner}=-3")
    ;;
esac

source ./scripts/slack/status_update.sh token="$auth_token" message="$message" ${slack_params[@]}
