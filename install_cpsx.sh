#! /bin/bash

#installing shareable-block
cd /edx/app/edxapp
sudo git clone git+https://github.com/collabassess/CPSXblock.git
sudo -u edxapp /edx/bin/pip.edxapp install CPSXblock/ --no-deps
cd CPSXblock
echo -n Mysql root username: 
read -s root
echo -n password:
read -s password

mysql -u $root -p -h localhost < CPSXblock/Database\ file/collab_assess.sql
$password

sudo /edx/bin/supervisorctl restart edxapp:*