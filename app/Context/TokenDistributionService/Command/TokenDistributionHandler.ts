import TokenDistributionRequest from "./TokenDistributionRequest";
import InternalBlockchainRepositoryInterface from "../../EES/Domain/InternalBlockchain/RepositoryInterface";
import RSquaredRepository from "../../EES/Infrastructure/InternalBlockchain/Repository/RSquaredReposistory";
import EthCrypto from "eth-crypto";
import Web3 from "web3";
import {provider} from "web3-core";
import AccountStore from "../../../stores/AccountStore";
// @ts-ignore
import {ChainStore} from "@r-squared/rsquared-js";

export default class TokenDistributionHandler {
    constructor(
        private internalBlockchainRepository: InternalBlockchainRepositoryInterface
    ) {}

    async execute(command: TokenDistributionRequest): Promise<void> {
        const web3 = new Web3(window.ethereum as provider);
        const phrase = command.phrase;
        const secretMsgSignature = (await window.ethereum.request({
            method: "personal_sign",
            params: [web3.utils.utf8ToHex(phrase), command.ethAccount]
        })) as string;

        const pubkeyEthCrypto = EthCrypto.recoverPublicKey(
            secretMsgSignature,
            web3.eth.accounts.hashMessage(phrase)
        );

        const balanceObject = await this.internalBlockchainRepository.getICOBalanceObject(
            command.ethAccount.substring(2)
        );

        const balance = await this.getCurrentBalance();
        setTimeout(() => {
            this.monitorBalance(balance);
        }, 1000);

        await this.internalBlockchainRepository.icoBalanceClaim(
            balanceObject[0],
            secretMsgSignature.substring(2),
            pubkeyEthCrypto,
            command.rsquaredAccount
        );
    }

    public static create(): TokenDistributionHandler {
        const internalRepository = RSquaredRepository.create();

        return new TokenDistributionHandler(internalRepository);
    }

    private async monitorBalance(startBalance: number) {
        console.log("monitoring balance");
        if ((await this.getCurrentBalance()) > startBalance) {
            location.assign("/token-distribution/done");
        }

        setTimeout(() => {
            this.monitorBalance(startBalance);
        }, 1000);
    }

    private async getCurrentBalance(): Promise<number> {
        const accountName = AccountStore.getState().currentAccount;
        const account = await ChainStore.getAccount(accountName);
        const balances = account.get("balances").get("1.3.0");
        if (!balances) return 0;
        const internalBalanceObject = await ChainStore.getObject(balances);
        if (!internalBalanceObject) return 0;
        return internalBalanceObject.get("balance");
    }
}
