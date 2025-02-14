#!/bin/bash

ts=""
channel_id=""
auth_token=""

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

owner="chocky335"
repo="keet-mobile"
variable_id="new0123"

response_slack_get=$(
  curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $auth_token" \
  -F channel=$channel_id \
  -F latest=$ts \
  -F limit=1 \
  -F inclusive=true \
  https://slack.com/api/conversations.history \

)
echo "conversations.history => $response_slack_get"

message_blocks=$(echo $response_slack_get | jq -r '.messages[] | select(type=="object" and has("blocks")) | .blocks' )
message_ts=$(echo $response_slack_get | jq -r '.messages[] | select(type=="object" and has("ts")) | .ts' )
message=$(jq -n \
  --arg channel "$channel_id" \
  --arg ts "$message_ts" \
  --argjson blocks "$message_blocks" \
  '$ARGS.named')

echo "slack_message_copy => $message"
