import { config } from 'dotenv';

config({ path: `${__dirname}/../.local.env` });

const {
  STATSD_HOST = 'localhost',
  STATSD_PORT = '8125',
  SOCKET_PORT = '8000',
} = process.env;

const statsd = {
  host: STATSD_HOST,
  port: parseInt(STATSD_PORT, 10),
};

const socketio = {
  port: parseInt(SOCKET_PORT, 10),
};

export {
  statsd,
  socketio,
};
