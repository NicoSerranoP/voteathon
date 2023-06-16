#!/bin/sh

rm -rf node_modules/@unirep

wget https://unirep-fix.s3.amazonaws.com/unirep-fix.zip
unzip unirep-fix.zip
cp -R @unirep node_modules/@unirep

rm -rf @unirep
rm unirep-fix.zip