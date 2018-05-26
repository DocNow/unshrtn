FROM node:latest
RUN mkdir /code
WORKDIR /code
ADD . /code
VOLUME /data
WORKDIR /code
EXPOSE 3000/tcp
RUN npm install
ENTRYPOINT ["node", "unshrtn.js", "start", "/data"]
