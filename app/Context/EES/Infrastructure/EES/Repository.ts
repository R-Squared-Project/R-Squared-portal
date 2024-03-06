import axios, {AxiosError} from "axios";
import RepositoryInterface, {
    EESSettings
} from "../../Domain/EES/RepositoryInterface";
import {EesAPI} from "../../../../api/apiConfig";
import * as EesErrors from "../../../EES/Domain/EES/Errors";

export default class Repository implements RepositoryInterface {
    public async loadEESSettings(): Promise<EESSettings> {
        const settings = (await axios.get(EesAPI.BASE + EesAPI.EES_SETTINGS))
            .data;

        return {
            depositContractAddress: settings.deposit_contract_address,
            withdrawContractAddress: settings.withdraw_contract_address,
            receiverAddress: settings.receiver_address,
            minimumValue: settings.minimum_deposit,
            minimumWithdrawAmount: settings.minimum_withdraw,
            minimumTimeLock: settings.minimum_timelock,
            rqrxWithdrawalFee: settings.rqrx_withdrawal_fee,
            RQETHWithdrawalFee: settings.rqeth_withdrawal_fee,
            rqethAssetSymbol: settings.rqeth_asset_symbol,
            eesAccountName: settings.rsquared_ees_account,
            withdrawTimeLock: settings.withdraw_timelock
        };
    }

    public async createDepositRequest(
        internalAccount: string,
        hashLock: string
    ): Promise<string> {
        try {
            const result = await axios.post(
                EesAPI.BASE + EesAPI.SUBMIT_DEPOSIT_REQUEST,
                {
                    rsquaredAccount: internalAccount,
                    hashLock: this.ensureHasPrefix(hashLock)
                }
            );

            return result.data.id;
        } catch (e) {
            throw new EesErrors.ConnectionError();
        }
    }

    public async createWithdrawRequest(
        internalAccount: string,
        amountToPayInRQETH: number,
        addressOfUserInEthereum: string,
        withdrawalFeeAmount: number,
        withdrawalFeeCurrency: string
    ): Promise<string> {
        try {
            const result = await axios.post(
                EesAPI.BASE + EesAPI.SUBMIT_WITHDRAW_REQUEST,
                {
                    rsquaredAccount: internalAccount,
                    amountToPayInRQETH: amountToPayInRQETH,
                    addressOfUserInEthereum: addressOfUserInEthereum,
                    withdrawalFeeAmount: withdrawalFeeAmount,
                    withdrawalFeeCurrency: withdrawalFeeCurrency
                }
            );

            return result.data.id;
        } catch (e) {
            if (e instanceof AxiosError) {
                throw new EesErrors.ConnectionError(e.response?.data?.message);
            }
            throw new EesErrors.ConnectionError();
        }
    }

    public async checkDepositSubmittedToInternalBlockchain(
        sessionId: string
    ): Promise<boolean> {
        const result = await axios.post(
            EesAPI.BASE + EesAPI.CHECK_DEPOSIT_SUBMITTED_TO_INTERNAL_BLOCKCHAIN,
            {
                sessionId: sessionId
            }
        );

        return result.data.submitted;
    }

    public async getWithdrawExternalContractId(
        sessionId: string
    ): Promise<string> {
        const result = await axios.post(
            EesAPI.BASE + EesAPI.GET_WITHDRAW_EXTERNAL_CONTRACT_ID,
            {
                sessionId: sessionId
            }
        );

        return result.data.contractId;
    }

    public async getDepositExternalContractRefundData(
        sessionId: string
    ): Promise<{
        contractId: string;
        sender: string;
        refundedInExternalBlockchain: boolean;
    }> {
        const result = await axios.post(
            EesAPI.BASE + EesAPI.GET_DEPOSIT_EXTERNAL_CONTRACT_ID,
            {
                sessionId: sessionId
            }
        );

        return {
            contractId: result.data.contractId,
            sender: result.data.sender,
            refundedInExternalBlockchain:
                result.data.refundedInExternalBlockchain
        };
    }

    public async getDepositsStatuses(
        sessionIds: string[]
    ): Promise<
        {
            sessionId: string;
            status: number;
        }[]
    > {
        const result = await axios.post(
            EesAPI.BASE + EesAPI.GET_DEPOSITS_STATUSES,
            {
                sessionIds: sessionIds
            }
        );

        return result.data;
    }

    private ensureHasPrefix(hashLock: string) {
        if ("0x" !== hashLock.substring(0, 2)) {
            hashLock = "0x" + hashLock;
        }

        return hashLock;
    }
}
