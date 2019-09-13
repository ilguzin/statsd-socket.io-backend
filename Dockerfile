FROM node:10.15.3

RUN mkdir /app
WORKDIR /app

COPY package-lock.json /app/package-lock.json
COPY package.json /app/package.json

RUN npm ci

COPY src /app/src
COPY tsconfig.json /app/tsconfig.json

RUN npm run build

RUN npm link

RUN git clone git://github.com/etsy/statsd.git /usr/local/src/statsd

COPY test/statsd/config.json /etc/default/statsd.js

RUN cd /usr/local/src/statsd && npm link statsd-socket.io-backend

ENV STATSD_PORT 8125
ENV STATSD_DUMP_MSG false
ENV STATSD_DEBUG false
ENV STATSD_FLUSH_INTERVAL 0

EXPOSE 8125/udp
EXPOSE 8126/tcp

CMD node /usr/local/src/statsd/stats.js /etc/default/statsd.js