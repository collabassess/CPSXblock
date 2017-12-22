# CPSXBLOCK

 An xblock for the open-edx platform that allows real-time collaboration tools for students



## Installing this Xblock

Step 1: Login to your edx-instance, <br>
Note: this Xblock has been tested to work with the latest edx ginko instance

Step 2: Clone the repo
<pre>
sudo git clone git+https://github.com/collabassess/CPSXblock.git
</pre>

Step 3: Install the Xblock
<pre>
sudo -u edxapp /edx/bin/pip.edxapp install CPSXblock/ --no-deps

#To upgrade the version, use the following flag:

--upgrade to upgrade
</pre>

important note: please use --no-deps, else openedx installation breaks

Step 4:

Assuming your location is inside just outside CPSXblock folder

<pre>
mysql -u <i>your_root_access_user</i> -p -h localhost < CPSXblock/Database\ file/collab_assess.sql
</pre>

\[<i>enter database password- default is empty\]</i>


Step 5:
Restart lms and cms after install/upgrade(be careful this might break the openedx installation if --no-deps not used)

<pre>
sudo /edx/bin/supervisorctl restart edxapp:*

##check status:

sudo /edx/bin/supervisorctl status edxapp:*
</pre>