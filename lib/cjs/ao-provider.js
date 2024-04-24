"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AoProvider = void 0;
const aoconnect_1 = require("@permaweb/aoconnect");
class AoProvider {
    processId;
    scheduler;
    ao;
    constructor(params) {
        this.processId = params.processId;
        this.scheduler = params.scheduler;
        this.ao = (0, aoconnect_1.connect)(params.connectConfig);
    }
}
exports.AoProvider = AoProvider;
