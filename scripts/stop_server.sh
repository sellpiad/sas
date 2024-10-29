#!/bin/bash
pm2 stop sas-frontend || true
pkill -f 'java -jar' || true