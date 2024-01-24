export default class MakeDepositRefundResponse {
    constructor(
        private _success: boolean,
        private _txHash: string,
        private _errorMessage: string = ""
    ) {}

    get success(): boolean {
        return this._success;
    }

    get txHash(): string {
        return this._txHash;
    }

    get errorMessage(): string {
        return this._errorMessage;
    }
}
