export default class TokenDistributionRequest {
    constructor(private _rsquaredAccount: string, private _phrase: string) {}

    get rsquaredAccount(): string {
        return this._rsquaredAccount;
    }

    get phrase(): string {
        return this._phrase;
    }
}
