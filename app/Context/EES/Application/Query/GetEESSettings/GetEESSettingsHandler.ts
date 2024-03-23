import axios from "axios";
import GetEESSettings from "./GetEESSettings";
import {EesAPI} from "../../../../../api/apiConfig";
import EesRepository from "../../../Infrastructure/EES/Repository";
import {EESSettings} from "../../../Domain/EES/RepositoryInterface";

export default class GetEESSettingsHandler {
    constructor(private readonly repository: EesRepository) {}

    async execute(query: GetEESSettings): Promise<EESSettings> {
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
            eesAccountName: settings.ees_account_name,
            withdrawTimeLock: settings.withdraw_timelock
        };
    }
}
