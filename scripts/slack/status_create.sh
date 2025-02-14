#!/bin/bash

# BUILD STATUS:
# -2 - cancelled
# -1 - failed
#  0 - pending
#  1 - running
#  2 - success
#  * - skipped

branch=""
version=""
channel_id=""
changelog=""
auth_token=""
apk=-2
apk_link=""
apk_sv=-2
apk_sv_link=""
aab=-2
aab_link=""
ios=-2
ios_link=""
is_sentry=""
extra_statuses=""
git_link=""


for val in "$@"; do
  echo "$val"
  if [[ $val == "apk="* ]]; then
    apk="${val#"apk="}"
  elif [[ $val == "aab="* ]]; then
    aab="${val#"aab="}"
  elif [[ $val == "apk_sv="* ]]; then
    apk_sv="${val#"apk_sv="}"
  elif [[ $val == "ios="* ]]; then
    ios="${val#"ios="}"
  elif [[ $val == "branch="* ]]; then
    branch="${val#"branch="}"
  elif [[ $val == "version="* ]]; then
    version="${val#"version="}"
  elif [[ $val == "channel_id="* ]]; then
    channel_id="${val#"channel_id="}"
  elif [[ $val == "token="* ]]; then
    auth_token="${val#"token="}"
  elif [[ $val == "changelog="* ]]; then
    changelog="${val#"changelog="}"
    source ./scripts/slack/split_chunks.sh "$changelog"
  elif [[ $val == "apk_link="* ]]; then
    apk_link="${val#"apk_link="}"
  elif [[ $val == "apk_sv_link="* ]]; then
    apk_sv_link="${val#"apk_sv_link="}"
  elif [[ $val == "aab_link="* ]]; then
    aab_link="${val#"aab_link="}"
  elif [[ $val == "is_sentry="* ]]; then
    is_sentry="${val#"is_sentry="}"
  elif [[ $val == "git_link="* ]]; then
    git_link="${val#"git_link="}"
  elif [[ $val == "app_icon="* ]]; then
    extra_statuses="${val#"app_icon="} "
  fi
done

if [[ $is_sentry == 1 ]]; then
  extra_statuses+=":sentry: "
fi

getStatusEmoji() {
  case "$1" in
    -2) echo ":ga-cancelled:" ;;
    -1) echo ":ga-failed:" ;;
    0) echo ":ga-pending:" ;;
    1) echo ":ga-running:" ;;
    2) echo ":ga-success:" ;;
    *) echo ":ga-skipped:" ;;
  esac
}

getStatusLink() {
  status_emoji="$(getStatusEmoji "$2")"
  if [[ $3 ]]; then
    echo "<$3|$1 $status_emoji>"
  else
    echo "$1 $status_emoji"
  fi
}

data=$(cat <<EOF
{
  "channel": "$channel_id",
  "blocks": [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
        "text": "$extra_statuses *<$git_link|$version ($branch)>*"
			}
		},
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "Android:\\n$(getStatusLink "apk" "$apk" "$apk_link") | $(getStatusLink "SV" "$apk_sv" "$apk_sv_link") | $(getStatusLink "aab" "$aab" "$aab_link")"
        },
        {
          "type": "mrkdwn",
          "text": "IOS:\\n$(getStatusLink "Testflight"  "$ios" "$ios_link")"
        }
      ]
    },
    {
      "type": "context",
      "elements": []
    }
  ]
}
EOF
)

for i in "${!chunks[@]}"; do
    echo "_Chunk $((i+1)):"
    current_chunk="${chunks[$i]}"
    current_chunk_title=$([ $i == 0 ] && echo "*Changelog:*\n" || echo "")
    current_section=$(jq -n --arg type "mrkdwn" --arg text "${current_chunk_title}${current_chunk}" '$ARGS.named')
    current_section=$(echo -e "$current_section" | sed 's/\\\\n/\\n/g')

    echo "${current_section}"
    echo "-----------------------------------"

    data=$(echo "$data" | jq ".blocks[2].elements += [$(echo $current_section)]")
done

echo "request_chat_postMessage=>$data"

response_chat_postMessage=$(curl -s -X POST -H "Content-type: application/json" -H "Authorization: Bearer $auth_token" --data "$data" "https://slack.com/api/chat.postMessage")

echo "response_chat_postMessage => $response_chat_postMessage"

ts=$(echo $response_chat_postMessage | jq -r '.ts')

echo "thread_ts => $ts"
# Tag Nick to notify about build
response_chat_postMessage_2=$(curl -s -X POST \
  -F token="$auth_token" \
  -F thread_ts="$ts" \
  -F channel="$channel_id" \
  -F text="CC: <@U055T8EEV8E> <@U07G65RAC6L>" \
  https://slack.com/api/chat.postMessage)

echo "response_chat_postMessage_2 => $response_chat_postMessage_2"
