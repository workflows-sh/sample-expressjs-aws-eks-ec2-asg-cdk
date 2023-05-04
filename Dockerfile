FROM registry.cto.ai/official_images/node:2.7.4-12.13.1-buster-slim

WORKDIR /ops

COPY package.json ./
COPY yarn.lock ./

RUN npm install

ADD . .

EXPOSE 3000
CMD ["node", "index.js"]
