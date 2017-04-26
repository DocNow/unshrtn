FROM node:latest
MAINTAINER Daniel Krech <eikeon@eikeon.com>
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get -qq update && apt-get -qqy install git && apt-get clean
RUN curl -sL https://deb.nodesource.com/setup_6.x -o nodesource_setup.sh && bash nodesource_setup.sh && apt-get install nodejs
RUN npm install -g coffee-script mocha && npm cache clear
RUN adduser --system --disabled-password --shell /bin/bash --group unshrtn --uid 1000
RUN install -d /opt/unshrtn --owner=unshrtn --group=unshrtn
WORKDIR /opt/unshrtn
USER unshrtn
COPY package.json /opt/unshrtn/
RUN npm install
COPY . /opt/unshrtn/
USER root
RUN chown -hR unshrtn:unshrtn /opt/unshrtn
USER unshrtn
RUN coffee -c unshrtn.coffee
EXPOSE  3000
CMD npm start
