FROM node:22
RUN mkdir /opt/app
WORKDIR /opt/app
# install deps first (cacheable)
COPY package*.json ./
RUN npm install
# copy all app files (including controllers/repositories)
COPY . .
ENTRYPOINT [ "node", "app.js" ]