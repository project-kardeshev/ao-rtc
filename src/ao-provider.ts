import { connect } from "@permaweb/aoconnect";
import { Services } from "@permaweb/aoconnect/dist/index.common";
import { DryRun } from "@permaweb/aoconnect/dist/lib/dryrun";
import { SendMessage } from "@permaweb/aoconnect/dist/lib/message";
import { SendMonitor } from "@permaweb/aoconnect/dist/lib/monitor";
import { ReadResult } from "@permaweb/aoconnect/dist/lib/result";
import { ReadResults } from "@permaweb/aoconnect/dist/lib/results";
import { SpawnProcess } from "@permaweb/aoconnect/dist/lib/spawn";

export interface AoClient {
  processId: string;
  scheduler?: string; // arweave txid of schedular location
  ao: {
    message: SendMessage;
    result: ReadResult;
    results: ReadResults;
    dryrun: DryRun;
    spawn: SpawnProcess;
    monitor: SendMonitor;
    unmonitor: SendMonitor;
  };
}

export class AoProvider implements AoClient {
  processId: string;
  scheduler?: string;
  ao: {
    message: SendMessage;
    result: ReadResult;
    results: ReadResults;
    dryrun: DryRun;
    spawn: SpawnProcess;
    monitor: SendMonitor;
    unmonitor: SendMonitor;
  };

  constructor(params: {
    processId: string;
    scheduler?: string;
    connectConfig?: Services;
  }) {
    this.processId = params.processId;
    this.scheduler = params.scheduler;
    this.ao = connect(params.connectConfig);
  }
}
