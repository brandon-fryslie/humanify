#!/bin/bash
# Wrapper script that loads API key and runs a command
export OPENAI_API_KEY=$(cat ~/.rad-aik | base64 -d)
exec "$@"
