FROM alpine
# Nonsense changes all around! We need lots of files to review!
RUN apk add --update nodejs npm

WORKDIR /ops

ADD package.json .

RUN npm install

ADD . .

ENTRYPOINT node /ops/index.js
