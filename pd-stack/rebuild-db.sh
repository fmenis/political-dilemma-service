# /bin/bash

echo "==============================="
echo " Rebuild postgres database "
echo "==============================="

cd ./pd-stack

echo "Stop postgres container"
docker container stop postgres-pd
echo "Remove postgres container"
docker container rm postgres-pd
echo "Remove postgres data (volume)"
docker volume rm postgres-pd
echo "Relaunch stack"
docker compose up -d