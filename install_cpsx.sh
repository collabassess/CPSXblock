#! /bin/bash

#installing shareable-block
cd /edx/app/edxapp
sudo git clone git+https://github.com/collabassess/CPSXblock.git
sudo -u edxapp /edx/bin/pip.edxapp install CPSXblock/ --no-deps
cd CPSXblock
stty -echo
printf "Mysql root username:" 
read -s root
printf "\n"
printf "password"
read -s password
printf "\n"

mysql -u $root -p -h localhost < Database\ file/collab_assess.sql
$password

sudo /edx/bin/supervisorctl restart edxapp:*