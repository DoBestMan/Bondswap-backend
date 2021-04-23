#!/bin/bash

set -e

yarn

nohup yarn start:dev > ~/app.log 2>&1 &

