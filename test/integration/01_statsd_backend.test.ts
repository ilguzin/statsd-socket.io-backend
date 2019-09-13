import * as io from 'socket.io-client';
import { StatsD } from 'hot-shots';

import { statsd as statsdConfig, socketio as socketioConfig } from '../config';

const JEST_TIMEOUT = 10000;

jest.setTimeout(JEST_TIMEOUT);

interface ISdcConnectionOptions {
  host: string;
  port: number;
  prefix?: string;

  errorHandler?: (error: Error) => void;
}

interface ISampleTimerResponse {
  pctThreshold: number[];
  statsd_metrics: {
    processing_time: number;
  };
  timer: number[];
  timer_counter: number;
  timer_data: {
    count_90: number;
    mean_90: number;
    upper_90: number;
    sum_90: number;
    sum_squares_90: number;
    std: number;
    upper: number;
    lower: number;
    count: number;
    count_ps: number;
    sum: number;
    sum_squares: number;
    mean: number;
    median: number;
  };
}

const makeSdcClient = (options: ISdcConnectionOptions) => {
  return new StatsD(options);
};

// @ts-ignore
const sdc = makeSdcClient({ ...statsdConfig, protocol: 'udp' });

const TEST_STATSD_METRIC_NAME = 'ci_integration_test.statsd_test_metric';

describe('socket.io backend', () => {
  const socket = io.connect(`http://${statsdConfig.host}:${socketioConfig.port}`);

  socket.on('error', (error: Error) => {
    console.error(error);
  });

  beforeAll((done) => {
    socket.on('connect', done);
  });

  afterAll((done) => {
    socket.close();
    sdc.close(done);
  });

  it('should receive timing report over socket.io', async () => {
    const timerLower = 1150;
    const timerMid = 1520;
    const timerUpper = 1810;
    sdc.timing(TEST_STATSD_METRIC_NAME, timerLower);
    sdc.timing(TEST_STATSD_METRIC_NAME, timerMid);
    sdc.timing(TEST_STATSD_METRIC_NAME, timerUpper);

    const data: ISampleTimerResponse = await new Promise((resolve) => socket.on(TEST_STATSD_METRIC_NAME, (d: any) => {
      resolve(d);
    }));

    expect(data.timer).toContain(timerMid);
    expect(data.timer_counter).toEqual(3);
    expect(data.timer_data.lower).toEqual(timerLower);
    expect(data.timer_data.upper).toEqual(timerUpper);
  });
});
