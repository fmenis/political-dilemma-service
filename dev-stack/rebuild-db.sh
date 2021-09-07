# /bin/bash

echo "==============================="
echo " Rebuild postgres dps database "
echo "==============================="

cd ./dev-stack

echo "Stop postgres container"
docker container stop postgres
echo "Remove postgres container"
docker container rm postgres
echo "Remove postgres data (volume)"
docker volume rm postgres
echo "Relaunch stack init script"
./init.sh