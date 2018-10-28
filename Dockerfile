FROM node:latest
VOLUME /data
EXPOSE 3000/tcp
RUN mkdir /unshrtn
WORKDIR /unshrtn
RUN npm install unshrtn
VOLUME /data
ENTRYPOINT ["node_modules/.bin/unshrtn", "start", "--database", "/data/unshrtn.db", "--port", "3000", "--host", "0.0.0.0"]
