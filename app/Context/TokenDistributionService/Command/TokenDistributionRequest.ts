export default class TokenDistributionRequest {
    constructor(
        private _rsquaredAccount: string,
        private _ethAccount: string,
        private _phrase: string
    ) {}

    get rsquaredAccount(): string {
        return this._rsquaredAccount;
    }

    get ethAccount(): string {
        return this._ethAccount;
    }

    get phrase(): string {
        return this._phrase;
    }
}
