export interface EESSettings {
    depositContractAddress: string;
    receiverAddress: string;
    minimumValue: string;
    minimumWithdrawAmount: string;
    minimumTimeLock: number;
    rqrxWithdrawalFee: number;
    RQETHWithdrawalFee: number;
    rqethAssetSymbol: string;
    eesAccountName: string;
    withdrawTimeLock: number;
    withdrawContractAddress: string;
}

export default interface RepositoryInterface {
    loadEESSettings: () => Promise<EESSettings>;
    createDepositRequest: (
        internalAccount: string,
        hashLock: string
    ) => Promise<string>;
    createWithdrawRequest: (
        internalAccount: string,
        amountToPayInRQETH: number,
        addressOfUserInEthereum: string,
        withdrawalFeeAmount: number,
        withdrawalFeeCurrency: string
    ) => Promise<string>;
}
