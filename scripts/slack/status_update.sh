#!/bin/bash

# BUILD STATUS:
# -2 - cancelled
# -1 - failed
#  0 - pending
#  1 - running
#  2 - success
#  * - skipped

message=""
auth_token=""

for val in "$@"; do
  echo "$val"
  if [[ $val == "message="* ]]; then
    message="${val#"message="}"
  elif [[ $val == "apk="* ]]; then
    apk="${val#"apk="}"
  elif [[ $val == "aab="* ]]; then
    aab="${val#"aab="}"
  elif [[ $val == "apk_sv="* ]]; then
    apk_sv="${val#"apk_sv="}"
  elif [[ $val == "ios="* ]]; then
    ios="${val#"ios="}"
  elif [[ $val == "token="* ]]; then
    auth_token="${val#"token="}"
  elif [[ $val == "apk_link="* ]]; then
    apk_link="${val#"apk_link="}"
  elif [[ $val == "apk_sv_link="* ]]; then
    apk_sv_link="${val#"apk_sv_link="}"
  elif [[ $val == "aab_link="* ]]; then
    aab_link="${val#"aab_link="}"
  elif [[ $val == "ios_link="* ]]; then
    ios_link="${val#"ios_link="}"
  fi
done

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
    echo "<$3\|$1 $status_emoji>"
  else
    echo "$1 $status_emoji"
  fi
}

android_statuses="$(echo $message | jq -r '.blocks[1].fields[0]')"
if [[ $apk ]]; then
  apk_status=$(getStatusLink "apk" "$apk" "$apk_link")
  android_statuses=$(echo "$android_statuses" | perl -pe "s/\<.*?\|(apk.*)?>/\$1/")
  android_statuses="$(echo "$android_statuses" | perl -pe "s|(apk :ga-.+?:)|$apk_status|")"
fi

if [[ $apk_sv ]]; then
  apk_sv_status=$(getStatusLink "SV" "$apk_sv" "$apk_sv_link")
  android_statuses=$(echo "$android_statuses" | perl -pe "s/ \<.*?\|(SV.*)?>/ \$1/")
  android_statuses="$(echo "$android_statuses" | perl -pe "s|(SV :ga-.+?:)|$apk_sv_status|")"
fi

if [[ $aab ]]; then
  aab_status=$(getStatusLink "aab" "$aab" "$aab_link")
  android_statuses=$(echo "$android_statuses" | perl -pe "s/ \<.*?\|(aab.*)?>/ \$1/")
  android_statuses="$(echo "$android_statuses" | perl -pe "s|(aab :ga-.+?:)|$aab_status|")"
fi

ios_statuses="$(echo $message | jq -r '.blocks[1].fields[1]')"

if [ -n "$ios" ]; then
  ios_status=$(getStatusLink "Testflight"  "$ios" "$ios_link")
  ios_statuses=$(echo "$ios_statuses" | perl -pe "s/ \<.*?\|(Testflight.*)?>/ \$1/")
  ios_statuses="$(echo "$ios_statuses" | perl -pe "s|(Testflight :ga-.+?:)|$ios_status|")"
fi

message=$(echo $message | jq ".blocks[1].fields[0] = $android_statuses")
message=$(echo $message | jq ".blocks[1].fields[1] = $ios_statuses")

echo "request_chat_update => $message_body"

response_chat_update=$(
  curl -s  \
  -X POST  \
  -H "Content-type: application/json"  \
  -H "Authorization: Bearer $auth_token"  \
  -d "$message"  \
  "https://slack.com/api/chat.update"
)

echo "response_chat_update => $(echo $response_chat_update | jq .)"
