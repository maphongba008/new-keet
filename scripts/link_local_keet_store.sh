#!/bin/bash

# Function to display help message
function show_help {
    echo "Usage: link_local_keet_store.sh [-r|--relative-path VALUE | -p|--path VALUE]"
    echo ""
    echo "Options:"
    echo "  -r|--relative-path VALUE   Specify a relative path"
    echo "  -p|--path VALUE            Specify an absolute path"
    echo ""
}

# Initialize variables
RELATIVE_PATH=""
ABSOLUTE_PATH=""
METRO_PATCH="./scripts/link-keet-store.patch"
METRO_FILE="./metro.config.js"

# Parse command-line arguments
while [[ "$#" -gt 0 ]]; do
    case "$1" in
        -r|--relative-path)
            RELATIVE_PATH="/$2"
            shift 2
            ;;
        -p|--path)
            ABSOLUTE_PATH="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown parameter: $1"
            show_help
            exit 1
            ;;
    esac
done

# Check if either --relative-path or --path is set
if [[ -n "$RELATIVE_PATH" ]]; then
    echo "Relative path specified: $RELATIVE_PATH"
elif [[ -n "$ABSOLUTE_PATH" ]]; then
    echo "Absolute path specified: $ABSOLUTE_PATH"
else
    echo "Error: Either --relative-path or --path must be specified."
    show_help
    exit 1
fi

git apply $METRO_PATCH

sed -i "" "s|\$RELATIVE_PATH|$RELATIVE_PATH|g" "$METRO_FILE"
if [[ -n "$RELATIVE_PATH" ]]; then
    echo "Replaced RELATIVE_PATH with $RELATIVE_PATH in $METRO_FILE"
fi

sed -i "" "s|\$ABSOLUTE_PATH|$ABSOLUTE_PATH|g" "$METRO_FILE"
if [[ -n "$ABSOLUTE_PATH" ]]; then
    echo "Replaced ABSOLUTE_PATH with $ABSOLUTE_PATH in $METRO_FILE"
fi

rm -rf ./node_modules/@holepunchto/keet-store/
echo "Removed keet-store from node_modules"