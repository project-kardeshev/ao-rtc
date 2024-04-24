import { connect } from '@permaweb/aoconnect';

export interface AoClient {
  processId: string;
  scheduler?: string; // arweave txid of schedular location
  ao: {
    message: any;
    result: any;
    results: any;
    dryrun: any;
    spawn: any;
    monitor: any;
    unmonitor: any;
  };
}

export class AoProvider implements AoClient {
  processId: string;
  scheduler?: string;
  ao: {
    message: any;
    result: any;
    results: any;
    dryrun: any;
    spawn: any;
    monitor: any;
    unmonitor: any;
  };

  constructor(params: {
    processId: string;
    scheduler?: string;
    connectConfig?: any;
  }) {
    this.processId = params.processId;
    this.scheduler = params.scheduler;
    this.ao = connect(params.connectConfig);
  }
}
