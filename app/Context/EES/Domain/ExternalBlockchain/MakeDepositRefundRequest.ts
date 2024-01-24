export default class MakeDepositRefundRequest {
    constructor(
        private _contractId: string,
        private _contractAddress: string,
        private _sender: string
    ) {}

    get contractId(): string {
        return this._contractId;
    }

    get contractAddress(): string {
        return this._contractAddress;
    }

    get sender(): string {
        return this._sender;
    }
}
