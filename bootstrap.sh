#!/bin/bash

set -e

yarn

yarn build

NODE_ENV=production pm2 start dist/main.js


