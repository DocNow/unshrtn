FROM node:latest
MAINTAINER Daniel Krech <eikeon@eikeon.com>
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get -qq update && apt-get -qqy install git && apt-get clean
RUN npm install -g coffee-script mocha && npm cache clear
RUN adduser --system --disabled-password --shell /bin/bash --group unshrtn --uid 1000
RUN install -d /opt/unshrtn --owner=unshrtn --group=unshrtn
WORKDIR /opt/unshrtn
USER unshrtn
COPY package.json /opt/unshrtn/
RUN npm install
COPY . /opt/unshrtn/
RUN coffee -c unshrtn.coffee
EXPOSE  3000
CMD npm start
