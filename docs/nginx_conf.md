### DEV

server {
listen 443 ssl http2; # managed by Certbot
ssl_certificate /etc/letsencrypt/live/api-dev.dilemmapolitico.info/fullchain.pem; # managed by Certbot
ssl_certificate_key /etc/letsencrypt/live/api-dev.dilemmapolitico.info/privkey.pem; # managed by Certbot
#include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
ssl_ciphers EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;
ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

server_name api-dev.dilemmapolitico.info;

    location / {
    # First attempt to serve request as file, then
    # as directory, then fall back to displaying a 404.
    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;
    try_files $uri $uri/ =404;
    }

location /api { # rate limiting
limit_req zone=mylimit burst=10 nodelay;

    # reverse proxy
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Host $host:$server_port;
    proxy_cache_bypass $http_upgrade;

}

    location /static/ {
    root /opt/dilemma-static;
    try_files $uri $uri/ =404;
    }

    # restrict doc unprotected api
    location /doc {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Host $host:$server_port;
    proxy_cache_bypass $http_upgrade;

    auth_basic "Restricted Content";
    auth_basic_user_file /etc/nginx/.htpasswd;

}

}

### PROD

server {
listen 443 ssl; # managed by Certbot
ssl_certificate /etc/letsencrypt/live/api.dilemmapolitico.info/fullchain.pem; # managed by Certbot
ssl_certificate_key /etc/letsencrypt/live/api.dilemmapolitico.info/privkey.pem; # managed by Certbot
include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

    server_name api.dilemmapolitico.info;


    location / {
      # First attempt to serve request as file, then
      # as directory, then fall back to displaying a 404.
      root /var/www/html;
      index index.html index.htm index.nginx-debian.html;
      try_files $uri $uri/ =404;
    }

    location /api {
      # rate limiting
      limit_req zone=mylimit burst=10 nodelay;

      # reverse proxy
      proxy_pass http://localhost:3000;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Host $host:$server_port;
      proxy_cache_bypass $http_upgrade;
    }


    location /static/ {
      root /opt/dilemma-static;
      try_files $uri $uri/ =404;
    }

}
