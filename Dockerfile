FROM registry.cto.ai/official_images/node:2-12.13.1-stretch-slim

WORKDIR /ops

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

ADD . .

EXPOSE 3000
CMD ["node", "index.js"]
