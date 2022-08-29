#!/bin/bash

# Enable logs
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "Update all packeges"
sudo apt update
sudo apt upgrade -y

echo "Install nginx"
sudo apt install nginx -y
service nginx status

echo "Install postgres 14"
#TODO

# Install nodejs
echo "Install nodejs"
#TODO


# Install and configure pm2
echo "Install and configure pm2"
npm install pm2
#TODO  

