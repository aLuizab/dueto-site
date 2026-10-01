# Site estático servido pelo Caddy (Railway define $PORT).
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY index.html /srv/
COPY assets /srv/assets
COPY data /srv/data
