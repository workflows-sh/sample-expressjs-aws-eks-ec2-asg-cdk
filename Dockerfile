FROM registry.cto.ai/official_images/node:2.7.4-12.13.1-buster-slim

WORKDIR /ops
USER ops

ADD package.json .
RUN npm install

ADD --chown=ops:9999 . .

ENTRYPOINT node /ops/index.js
