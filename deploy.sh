cd ~

if [ -d ~/recipes ]; then
    sudo rm -r recipes
fi

mkdir recipes

tar -zxvf ~/recipes.tar.gz -C recipes

echo "recipes unpacked, npm install"

cd recipes

npm install --production

echo "install finished, restarting service"

sudo mv ~/recipes.service /etc/systemd/system/recipes.service

sudo systemctl restart recipes.service

systemctl status recipes
