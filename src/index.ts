import * as ioServer from 'socket.io';
import { EventEmitter } from 'events';

export interface ISocketIOConfig {
  port: string;
}

export interface IStatsDConfig {
  debug: boolean;
  socketIoBackend: ISocketIOConfig;
}

interface IStatsDMetrics {
  counters: any;
  gauges: any;
  timers: any;
  sets: any;
  counter_rates: any;
  timer_counters: any;
  timer_data: any;
  statsd_metrics: any;
  pctThreshold: any;
}

const emitFlush = (socket: any, ts: number, metrics: IStatsDMetrics, logger: any, debug: boolean) => {
  // Unique list of metric keys
  const statKeys = Array.from(new Set(
    ['counters', 'gauges', 'timers'].reduce(
      // @ts-ignore
      (memo: string[], metricType: string) => [...memo, ...Object.keys(metrics[metricType])],
      [],
    ),
  ));

  socket.emit('metrics', { ts, metrics }); // Forward raw metrics data to listening socket

  statKeys.forEach((statKey: string) => {
    const data = {
      pctThreshold: metrics.pctThreshold,
      statsd_metrics: metrics.statsd_metrics,
    };
    if (metrics.counters[statKey]) {
      // @ts-ignore
      data.counter = metrics.counters[statKey];
      // @ts-ignore
      data.counter_rate = metrics.counter_rates[statKey];
    }
    if (metrics.gauges[statKey]) {
      // @ts-ignore
      data.gauge = metrics.gauges[statKey];
    }
    if (metrics.timers[statKey]) {
      // @ts-ignore
      data.timer = metrics.timers[statKey];
      // @ts-ignore
      data.timer_counter = metrics.timer_counters[statKey];
      // @ts-ignore
      data.timer_data = metrics.timer_data[statKey];
    }

    if (debug) { logger.log(`emit ${statKey}: ${JSON.stringify(data, undefined, 4)}`); }

    socket.emit(statKey, data);
  });
};

export const init = (startupTime: number, config: IStatsDConfig, events: EventEmitter, logger: any) => {
  const { debug, socketIoBackend: socketIoBackendConfig } = config;

  const startTime = new Date(startupTime).toISOString();

  if (debug) { logger.log(`${startTime}: statsd-socket.io-backend started`); }

  if (!socketIoBackendConfig.port) {
    logger.log('Error: socket.io connection port is not set'); return false;
  }

  const io = ioServer(socketIoBackendConfig.port);

  io.on('connection', (socket) => {
    const flushHandler = (ts: number, metrics: IStatsDMetrics) => {
      emitFlush(socket, ts, metrics, logger, debug);
    };

    events.addListener('flush', flushHandler);

    socket.on('disconnect', () => {
      events.removeListener('flush', flushHandler);
    });
  });

  return true;
};
