#!/bin/bash
rm -rf out || exit 0;
mkdir out;
( cd out
  git init
  git config user.name "Travis-CI"
  git config user.email "bekroogle@gmail.com"
  cp ../index.html ./index.html
  cp ../js ./ -r
  cp ../images ./ -r
  cp ../stylesheets ./ -r
  cp ../CNAME ./CNAME
  git add .
  git commit -m "Deployed to Github Pages"
  git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
)
