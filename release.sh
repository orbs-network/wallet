#!/bin/bash

npm run build
tar cvzf release.tar.gz extension

aws s3 cp --acl=public-read release.tar.gz s3://orbs-network-releases/wallet/beta/latest.tar.gz
aws s3 cp --acl=public-read release.tar.gz s3://orbs-network-releases/wallet/beta/$(date +%Y-%m-%d-%H%M%S).tar.gz