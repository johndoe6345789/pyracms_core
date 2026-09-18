#!/bin/bash
export GOCACHE=/tmp/gocache GOPATH=/tmp/go HOME=/tmp
echo "$1" > /tmp/main.go
cd /tmp && go run main.go
