sudo su 
sudo apt-get update 
sudo apt-get upgrade 

sudo apt-get install git 
sudo git clone https://github.com/kaushik-hemant/AgreegatorAPI

sudo npm install pm2 -g

sudo pm2 start AgreegatorAPI/agreegatorAPI.js
sudo pm2 start AgreegatorAPI/bootupStarter.js

sudo pm2 startup 
sudo pm2 save 
sudo pm2 update 





