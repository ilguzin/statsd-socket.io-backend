# statsd-socket.io-backend
[StatsD](https://github.com/etsy/statsd) [Socket.IO](https://socket.io) backend module. Will forward metrics data to Socket.IO client. The client is able to subscribe to metrics by StatsD statistics key.

[![Build Status](https://travis-ci.org/ilguzin/statsd-socket.io-backend.svg?branch=master)](https://travis-ci.org/ilguzin/statsd-socket.io-backend)
[![David Status](https://david-dm.org/ilguzin/statsd-socket.io-backend.svg)](https://github.com/ilguzin/statsd-socket.io-backend)

## Installation

### Simple way

To install the module you have to follow two step process:

* `npm install statsd-socket.io-backend` from the folder where you checked out [StatsD](https://github.com/etsy/statsd)
* Modify StatsD config file to have `statsd-socket.io-backend` backend enabled in the following way:

      {
        ...,
        "socketIoBackend": {
          "port": 8000
        },
        ...,
        "backends": [
          "statsd-socket.io-backend"
        ]
      }

### StatsD Docker Image with enabled statsd-socket.io-backend

StatsD `config.json`:

    {
      "port": 8125,
      "debug": true,
      "socketIoBackend": {
        "port": 8000
      },
      "flushInterval": 0,
      "backends": [
        "statsd-socket.io-backend"
      ]
    }

StatsD Dockerfile:

    FROM node:10.15.3

    RUN git clone git://github.com/etsy/statsd.git /usr/local/src/statsd

    # Important! you have to have a `config.json` file for StatsD in current folder
    COPY config.json /etc/default/statsd.js

    RUN cd /usr/local/src/statsd && npm install statsd-socket.io-backend

    EXPOSE 8125/udp
    EXPOSE 8126/tcp

    CMD node /usr/local/src/statsd/stats.js /etc/default/statsd.js

## Testing locally

You have to have Docker host up and running.

Set the following environment variables to your needs:

    export DOCKER_HOST_IP=192.168.99.103
    export STATSD_HOST=${DOCKER_HOST_IP}
    export STATSD_PORT=8125
    export SOCKET_PORT=8000 

Run the following commands:

    docker build -t ilguzin/statsd-socket.io-backend .

    docker run -itd -p ${STATSD_PORT}:${STATSD_PORT}/udp -p ${SOCKET_PORT}:${SOCKET_PORT} ilguzin/statsd-socket.io-backend

    npm run test:ci
