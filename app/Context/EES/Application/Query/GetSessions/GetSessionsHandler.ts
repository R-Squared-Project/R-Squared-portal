import GetSessions from "./GetSessions";
import Session from "../../../Domain/Deposit/Session";
import SessionRepositoryInterface from "../../../Domain/Deposit/SessionRepositoryInterface";
import {Result} from "../../../../Core";
import {UseCaseError} from "../../../../Core/Logic/AppError";
import {Success} from "../../../../Core/Logic/Result";
import EesRepository from "../../../Infrastructure/EES/Repository";

export default class GetSessionsHandler {
    constructor(private sessionRepository: SessionRepositoryInterface) {}

    async execute(
        query: GetSessions
    ): Promise<Result<UseCaseError, Session[]>> {
        const sessions = await this.sessionRepository.all(
            query.internalAccount
        );

        const eesRepository = new EesRepository();
        const ids = sessions.map(session => session.id);
        if (ids.length > 0) {
            (await eesRepository.getDepositsStatuses(ids)).forEach(
                ({sessionId, status}) => {
                    const session = sessions.find(
                        session => session.id === sessionId
                    );
                    if (session) {
                        session.setStatus(status);
                        this.sessionRepository.save(session);
                    }
                }
            );
        }

        return Success.create(sessions);
    }
}
