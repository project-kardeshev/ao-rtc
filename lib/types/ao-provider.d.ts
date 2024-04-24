export interface AoClient {
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
}
export declare class AoProvider implements AoClient {
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
    });
}
