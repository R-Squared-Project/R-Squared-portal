export default class SubmitWithdrawRequest {
    constructor(
        private _rsquaredAccount: string,
        private _value: number,
        private _withdrawalFeeCurrency: string,
        private _withdrawalFeeAmount: number,
        private _transactionFeeCurrency: string,
        private _transactionFeeAmount: number,
        private _hashLock: string,
        private _ethereumAddress: string
    ) {}

    get rsquaredAccount(): string {
        return this._rsquaredAccount;
    }

    get value(): number {
        return this._value;
    }

    get withdrawalFeeCurrency(): string {
        return this._withdrawalFeeCurrency;
    }

    get withdrawalFeeAmount(): number {
        return this._withdrawalFeeAmount;
    }

    get transactionFeeCurrency(): string {
        return this._transactionFeeCurrency;
    }

    get transactionFeeAmount(): number {
        return this._transactionFeeAmount;
    }

    get hashLock(): string {
        return this._hashLock;
    }

    get ethereumAddress(): string {
        return this._ethereumAddress;
    }
}
