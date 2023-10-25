// @ts-ignore
import {Apis} from "@r-squared/rsquared-js-ws";
import PrivateKeyStore from "../../../../../stores/PrivateKeyStore";
import Contract from "../../../Domain/InternalBlockchain/Contract";
import InternalBlockchainRepositoryInterface from "../../../Domain/InternalBlockchain/RepositoryInterface";
import {
    FetchChain,
    TransactionBuilder
    // @ts-ignore
} from "@r-squared/rsquared-js";
import WalletDb from "../../../../../stores/WalletDb";
import {EESSettings} from "../../../Domain/EES/RepositoryInterface";
// @ts-ignore
import {Map} from "immutable";
import Memo from "../Memo";
import WithdrawSession from "../../../Domain/Withdraw/WithdrawSession";
import AssetNormalizer from "../../AssetNormalizer";

const PREIMAGE_HASH_CIPHER_SHA256 = 2;
const PREIMAGE_LENGTH = 32;

export default class RSquaredRepository
    implements InternalBlockchainRepositoryInterface {
    constructor(private memo: Memo, private normalizer: AssetNormalizer) {}

    static create() {
        return new RSquaredRepository(new Memo(), new AssetNormalizer());
    }

    async loadContractsByAccount(account: string): Promise<Contract[]> {
        const rsquaredContracts = await Apis.instance()
            .db_api()
            .exec("get_htlc_by_to", [account, "1.16.0", 100]);

        const contracts: Contract[] = [];

        for (const contract of rsquaredContracts) {
            // Try to remove this dependency. Use only rsquaredjs package and Aes library from it. Method: decrypt_with_checksum
            const {text} = PrivateKeyStore.decodeMemo(contract.memo);
            contracts.push(new Contract(contract.id, text));
        }

        return contracts;
    }

    async withdraw(settings: EESSettings, session: WithdrawSession) {
        const transactionBuilder = new TransactionBuilder();

        const rsquaredAsset = await this.getAsset(settings.rsquaredCurrency);
        const internalAccount = await FetchChain(
            "getAccount",
            session.internalAccountName
        );
        const eesAccount = await FetchChain(
            "getAccount",
            settings.eesAccountName
        );
        const withdrawalFeeAsset = await this.getAsset(
            session.withdrawalFeeCurrency
        );

        const transactionFeeAsset = await this.getAsset(
            session.transactionFeeCurrency
        );

        transactionBuilder.add_type_operation("transfer", {
            fee: {
                amount: 0,
                asset_id: transactionFeeAsset.get("id")
            },
            from: internalAccount.get("id"),
            to: eesAccount.get("id"),
            amount: {
                amount: this.normalizer.denormalize(
                    session.withdrawalFeeAmount,
                    withdrawalFeeAsset
                ),
                asset_id: withdrawalFeeAsset.get("id")
            }
        });
        transactionBuilder.add_type_operation("htlc_create", {
            from: internalAccount.get("id"),
            to: eesAccount.get("id"),
            fee: {
                amount: 0,
                asset_id: transactionFeeAsset.get("id")
            },
            amount: {
                amount: this.normalizer.denormalize(
                    session.value,
                    rsquaredAsset
                ),
                asset_id: rsquaredAsset.get("id")
            },
            preimage_hash: [PREIMAGE_HASH_CIPHER_SHA256, session.hashLock],
            preimage_size: PREIMAGE_LENGTH,
            claim_period_seconds: settings.withdrawTimeLock
        });

        await WalletDb.process_transaction(
            transactionBuilder,
            null, //signer_private_keys,
            true
        );

        if (transactionBuilder.ref_block_num === 0) {
            throw new Error("Error creating withdraw contract.");
        }
    }

    private getPrivateKey(account: Map<string, any>) {
        const publicKey = this.memo.getPublicKey(account);
        return WalletDb.getPrivateKey(publicKey);
    }

    private async getAsset(currency: string): Promise<Map<string, any>> {
        return await FetchChain("getAsset", currency);
    }
}
