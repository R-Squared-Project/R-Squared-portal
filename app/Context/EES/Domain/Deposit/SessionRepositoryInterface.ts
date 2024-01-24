import Session from "./Session";

export default interface SessionRepositoryInterface {
    load: (sessionId: string) => Promise<Session | null>;
    all: (internalAccount: string) => Promise<Session[]>;
    save: (session: Session) => Promise<boolean>;
}
