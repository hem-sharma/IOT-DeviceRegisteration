sudo su 
sudo apt-get update 
sudo apt-get upgrade 

#node installing
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs 

#npm used in installing pm2 and serial-port
sudo apt-get install npm 

#cloning node application
sudo apt-get install git 
sudo git clone https://github.com/kaushik-hemant/AgreegatorAPI

#pm2 for managing node application
sudo npm install pm2 -g

sudo pm2 start AgreegatorAPI/agreegatorAPI.js
sudo pm2 start AgreegatorAPI/bootupStarter.js
sudo pm2 start AgreegatorAPI/gpsStarter.js

sudo pm2 startup 
sudo pm2 save 
sudo pm2 update 





