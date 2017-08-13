FROM node:latest
ADD *.js /code/
ADD *.json /code/
WORKDIR /code
RUN npm install
CMD ["node", "server.js"]
