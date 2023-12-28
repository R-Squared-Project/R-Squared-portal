import InternalBlockchainRepositoryInterface from "../../../Domain/InternalBlockchain/RepositoryInterface";
import SessionRepositoryInterface from "../../../Domain/Deposit/SessionRepositoryInterface";
import RSquaredRepository from "../../../Infrastructure/InternalBlockchain/Repository/RSquaredReposistory";
import SessionIndexedDBRepository from "../../../Infrastructure/SessionRepository/IndexedDBDepositSessionRepository";
import CheckDepositContractCreated from "./CheckDepositContractCreated";
import * as Errors from "./Errors";
import EesRepository from "../../../Infrastructure/EES/Repository";

export default class CheckDepositContractCreatedHandler {
    constructor(
        private readonly sessionRepository: SessionRepositoryInterface,
        private readonly internalBlockchainRepository: InternalBlockchainRepositoryInterface,
        private readonly eesRepository: EesRepository
    ) {}

    async execute(command: CheckDepositContractCreated): Promise<boolean> {
        const session = await this.sessionRepository.load(command.sessionId);

        if (session === null) {
            throw new Errors.SessionNotFoundError(command.sessionId);
        }

        const internalContracts = await this.internalBlockchainRepository.loadContractsByAccount(
            session.internalAccount
        );

        let result = false;
        try {
            result = await this.eesRepository.checkDepositSubmittedToInternalBlockchain(
                command.sessionId
            );
        } catch (e) {
            return false;
        }

        if (!result) {
            return false;
        }

        for (const internalContract of internalContracts) {
            if (
                internalContract.message ===
                this.remove0x(session.externalContract?.txHash as string)
            ) {
                session.createdInternalBlockchain(internalContract);
                await this.sessionRepository.save(session);

                return true;
            }
        }

        return false;
    }

    private remove0x(txHash: string): string {
        if ("0x" === txHash.substring(0, 2)) {
            return txHash.substring(2);
        }

        return txHash;
    }

    public static create(): CheckDepositContractCreatedHandler {
        const sessionRepository = new SessionIndexedDBRepository();
        const internalRepository = RSquaredRepository.create();
        const eesRepository = new EesRepository();
        return new CheckDepositContractCreatedHandler(
            sessionRepository,
            internalRepository,
            eesRepository
        );
    }
}
