#!/usr/bin/env bash

# Folder to scan (default to current directory)
FOLDER="${1:-.}"

# Recursively list all files and folders
find "$FOLDER"
