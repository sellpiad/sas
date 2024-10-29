#!/bin/bash

# React 서버 시작
pm2 serve /home/ubuntu/sas/frontend/build 3000 --spa --name sas-frontend

# Java 서버 시작
pm2 start java --name sas-backend -- -jar /home/ubuntu/sas/backend/backend.jar --spring.profiles.active=prod
