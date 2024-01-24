import MakeDepositRefund from "./MakeDepositRefund";
import SessionRepositoryInterface from "../../../Domain/Deposit/SessionRepositoryInterface";
import EesRepositoryInterface from "../../../Infrastructure/EES/Repository";
import ExternalBlockchainRepositoryInterface from "../../../Domain/ExternalBlockchain/RepositoryInterface";
import * as Errors from "./Errors";
import {WalletConnectionError} from "../../../../Core/Logic/AppError";
import MakeDepositRefundRequest from "../../../Domain/ExternalBlockchain/MakeDepositRefundRequest";
import Repository from "../../../Infrastructure/EES/Repository";
import Web3Repository from "../../../Infrastructure/ExternalBlockchain/Web3Repository";
import IndexedDBDepositSessionRepository from "../../../Infrastructure/SessionRepository/IndexedDBDepositSessionRepository";

export default class MakeDepositRefundHandler {
    constructor(
        private readonly sessionRepository: SessionRepositoryInterface,
        private readonly eesRepository: EesRepositoryInterface,
        private readonly web3Repository: ExternalBlockchainRepositoryInterface
    ) {}

    async execute(command: MakeDepositRefund): Promise<boolean> {
        const session = await this.sessionRepository.load(command.sessionId);

        if (session === null) {
            throw new Errors.SessionNotFoundError(command.sessionId);
        }

        const {
            contractId,
            sender,
            refundedInExternalBlockchain
        } = await this.eesRepository.getDepositExternalContractRefundData(
            command.sessionId
        );

        if (refundedInExternalBlockchain) {
            session.refundedInExternalBlockchain();
            await this.sessionRepository.save(session);

            return true;
        }

        const makeDepositRefundRequest = new MakeDepositRefundRequest(
            contractId,
            command.contractAddress,
            sender
        );

        const makeDepositRefundResponse = await this.web3Repository.refundDeposit(
            makeDepositRefundRequest
        );

        if (!makeDepositRefundResponse.success) {
            throw new WalletConnectionError(
                makeDepositRefundResponse.errorMessage
            );
        }

        session.refundedInExternalBlockchain();
        await this.sessionRepository.save(session);

        return true;
    }

    private ensureHasPrefix(hashLock: string) {
        if ("0x" !== hashLock.substring(0, 2)) {
            hashLock = "0x" + hashLock;
        }

        return hashLock;
    }

    public static create(): MakeDepositRefundHandler {
        const sessionRepository = new IndexedDBDepositSessionRepository();
        const eesRepository = new Repository();
        const web3Repository = new Web3Repository();
        return new MakeDepositRefundHandler(
            sessionRepository,
            eesRepository,
            web3Repository
        );
    }
}
