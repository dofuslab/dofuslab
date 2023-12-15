FROM nginx:stable-alpine
# https://hub.docker.com/_/nginx

# This image acts as a reverse proxy to our server and client
#  containers, negating CORS issues and presenting a single host
#  to users.

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
