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

for val in "$@"; do
  echo "$val"
  if [[ $val == "ts="* ]]; then
    ts="${val#"ts="}"
  elif [[ $val == "channel_id="* ]]; then
    channel_id="${val#"channel_id="}"
  elif [[ $val == "token="* ]]; then
    auth_token="${val#"token="}"
  fi
done

source ./scripts/slack/status_get.sh token="$auth_token" channel_id="$channel_id" ts="$ts"

message=$(echo "$message" | perl -pe "s/ga-running/ga-cancelled/g")
message=$(echo "$message" | perl -pe "s/ga-pending/ga-cancelled/g")

source ./scripts/slack/status_update.sh token="$auth_token" message="$message"
