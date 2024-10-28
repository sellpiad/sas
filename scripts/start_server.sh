#!/bin/bash

# React 서버 시작
pm2 serve start /home/ubuntu/sas/frontend 3000 --spa --name sas-frontend

# Java 서버 시작
nohup java -jar /home/ubuntu/sas/backend/sas-server-1.0.0.jar > /dev/null 2>&1 &