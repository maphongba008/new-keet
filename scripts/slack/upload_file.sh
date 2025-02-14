#!/bin/bash

ts=""
channel_id=""
auth_token=""
file_path=""
file_name=""

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
  fi
done

file_name=$(basename "$file_path")
file_size=$(wc -c < $file_path | xargs)

echo "file_path => $file_path"
echo "file_name => $file_name"
echo "file_size => $file_size"

response_files_getUploadURLExternal=$(curl -s -d "token=$auth_token" \
  -d "length=$file_size" \
  -d "filename=$file_name" \
  https://slack.com/api/files.getUploadURLExternal)

echo "files.response_files_getUploadURLExternal => $response_files_getUploadURLExternal"

upload_url=$(echo $response_files_getUploadURLExternal | jq -r '.upload_url')
file_id=$(echo $response_files_getUploadURLExternal | jq -r '.file_id')

echo "upload_url => $upload_url"
echo "file_id => $file_id"

response_files_upload=$(curl -v -F file=@$file_path "$upload_url")

echo "files.response_files_upload=>$response_files_upload"

data=$(cat <<EOF
[{"id": "$file_id"}]
EOF
)

echo "data => $data"

response_files_completeUploadExternal=$(curl -s -X POST \
  -F token="$auth_token" \
  -F thread_ts="$ts" \
  -F channel_id="$channel_id" \
  -F files="$data" \
  https://slack.com/api/files.completeUploadExternal)

echo "files.completeUploadExternal=>$response_files_completeUploadExternal"

file_url=$(echo $response_files_completeUploadExternal | jq -r '.files[] | select(type=="object" and has("permalink")) | .permalink')

echo "file_url => $file_url"
