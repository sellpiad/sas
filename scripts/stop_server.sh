#!/bin/bash
pm2 stop sas-frontend || true
pm2 stop sas-backend || true