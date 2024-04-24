import { connect } from '@permaweb/aoconnect';
export class AoProvider {
    processId;
    scheduler;
    ao;
    constructor(params) {
        this.processId = params.processId;
        this.scheduler = params.scheduler;
        this.ao = connect(params.connectConfig);
    }
}
