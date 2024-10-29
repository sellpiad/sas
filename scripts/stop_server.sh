#!/bin/bash
pm2 stop sas-frontend || true
pm2 delete sas-backend || true