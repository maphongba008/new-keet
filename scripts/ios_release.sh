#!/bin/bash

# Input file path
input_file="ios/Keet.xcodeproj/project.pbxproj"

# Read the content of the input file into an array
lines=()
while IFS= read -r line; do
    lines+=("$line")
done < "$input_file"

# Open the input file for writing
exec 3<>"$input_file"

# Clear the content of the file
truncate -s 0 "$input_file"

# Iterate over the lines and process them
for line in "${lines[@]}"; do
    if [[ $line =~ CODE_SIGN_IDENTITY ]]; then
      continue
    elif [[ $line =~ PROVISIONING_PROFILE_SPECIFIER ]]; then
      continue
    elif [[ $line =~ CODE_SIGN_STYLE\ =\ Manual ]]; then
      line=${line/Manual/Automatic}
    fi

    echo "$line" >&3
done

# Close the file descriptor
exec 3>&-

git apply "scripts/ios_release.patch"
NO_FLIPPER=1 scripts/setup.sh ios

