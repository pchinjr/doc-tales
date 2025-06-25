"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSourceAdapter = void 0;
// Base abstract class that implements common functionality
class BaseSourceAdapter {
    constructor(sourceType, communicationType) {
        this.connected = false;
        this.sourceType = sourceType;
        this.communicationType = communicationType;
    }
    getSourceType() {
        return this.sourceType;
    }
    getCommunicationType() {
        return this.communicationType;
    }
    isConnected() {
        return this.connected;
    }
}
exports.BaseSourceAdapter = BaseSourceAdapter;
//# sourceMappingURL=SourceAdapter.js.map