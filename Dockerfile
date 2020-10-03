FROM node:12.18.3-alpine
# uncomment if using node without alpine version && comment apk add
# RUN apt-get update ;\
#    apt-get install -y tzdata
RUN apk add --update tzdata

# Create app directory
WORKDIR /usr/src/hotelbe

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

RUN npm run build

CMD ["node", "dist/hotelbe"]