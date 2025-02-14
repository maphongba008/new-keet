#!/bin/bash

input="$1"
chunks=()
max_chars_per_chunk=2500

# Read the input and split into chunks
chunk_number=1
current_chunk=""
while IFS= read -r line; do
    current_line_length=${#line}
    if (( ${#current_chunk} + current_line_length + 1 > max_chars_per_chunk )); then
        # If adding the current line exceeds the limit, write the current chunk to a file
        chunks+=("$current_chunk")
        (( chunk_number++ ))
        current_chunk=""
    fi
    current_chunk+="$line\n"
done <<< "$(echo -e "$input")"

chunks+=("$current_chunk")
