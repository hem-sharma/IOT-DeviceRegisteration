#TODO: install node, pm2 for setup
sudo su &
sudo apt-get update &
sudo apt-get upgrade &
#node installing
sudo apt-get install nodejs &
#npm used in installing pm2 and serial-port
sudo apt-get install npm &
#cloning node application
sudo apt-get install git &
sudo git clone https://github.com/kaushik-hemant/AgreegatorAPI &

#pm2 for managing node application
sudo npm install pm2 -g &
sudo pm2 start /home/pi/AgreegatorAPI/agreegatorAPI.js
sudo pm2 startup &
sudo pm2 save &
sudo pm2 update &





