FROM node:latest
RUN mkdir /code
WORKDIR /code
ADD . /code
RUN npm install
CMD npm start
