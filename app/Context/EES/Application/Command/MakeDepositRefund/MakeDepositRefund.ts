export default class MakeDepositRefund {
    constructor(private _sessionId: string, private _contractAddress: string) {}

    get sessionId(): string {
        return this._sessionId;
    }

    get contractAddress(): string {
        return this._contractAddress;
    }
}
