FROM node:14.18.2 as base
WORKDIR /gebrid
RUN npm install -g truffle@5.4.17
COPY . .
RUN yarn install
RUN yarn bootstrap

FROM base as deploy
WORKDIR /gebrid/deploy
ENTRYPOINT ["truffle", "test", "--compile-all"]

FROM base as exchange
WORKDIR /gebrid/exchange
ENTRYPOINT ["truffle", "test", "--compile-all"]
