#!/bin/bash
echo "$1" > /tmp/main.rs
rustc -o /tmp/main /tmp/main.rs 2>&1 && /tmp/main
