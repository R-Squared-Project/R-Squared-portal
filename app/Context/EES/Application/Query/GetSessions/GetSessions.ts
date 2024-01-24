export default class GetSessions {
    constructor(private readonly _internalAccount: string) {}

    get internalAccount(): string {
        return this._internalAccount;
    }
}
