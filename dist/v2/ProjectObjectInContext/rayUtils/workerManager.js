"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RayWorkerManager = void 0;
const work = require("webworkify");
const q = require("q");
const raycastWorker = require("./raycastWorker");
class RayWorkerManager {
    constructor() {
        this.workInProg = new Map();
        this.workId = 0;
        this.worker = work(raycastWorker);
        this.worker.addEventListener('message', (ev) => {
            const prom = this.workInProg.get(ev.data.workId);
            prom.resolve(ev.data.res);
            this.workInProg.delete(ev.data.workId);
        });
    }
    work(arg) {
        const defered = q.defer();
        this.workInProg.set(this.workId, defered);
        this.worker.postMessage({ workId: this.workId, data: arg }); // send the worker a message
        this.workId += 1;
        return defered.promise;
    }
    static getInstance() {
        if (RayWorkerManager.instance)
            return RayWorkerManager.instance;
        RayWorkerManager.instance = new RayWorkerManager();
        return RayWorkerManager.instance;
    }
}
exports.RayWorkerManager = RayWorkerManager;
RayWorkerManager.instance = null;
exports.default = RayWorkerManager;
//# sourceMappingURL=workerManager.js.map