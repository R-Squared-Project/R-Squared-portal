import SessionRepositoryInterface from "../../Domain/Deposit/SessionRepositoryInterface";
import Session from "../../Domain/Deposit/Session";
import transformer from "./Transformer";
import IndexedDB, {DEPOSIT_SESSION_STORE} from "../IndexedDB/IndexedDB";

export default class IndexedDBDepositSessionRepository
    implements SessionRepositoryInterface {
    private db: IndexedDB;

    constructor() {
        this.db = IndexedDB.getInstance();
    }

    async load(sessionId: string): Promise<Session | null> {
        if (this.db === null) {
            return null;
        }
        const store = this.db
            .transaction(DEPOSIT_SESSION_STORE)
            .objectStore(DEPOSIT_SESSION_STORE);

        const request = await store.get(sessionId);

        // eslint-disable-next-line no-prototype-builtins
        if (request.hasOwnProperty("id") && request.id === sessionId) {
            // for Firefox
            return transformer.reverseTransform(request);
        }

        //TODO::remove indexeddbshim?
        return new Promise((resolve, reject) => {
            // @ts-ignore
            request.onsuccess = () => {
                // @ts-ignore
                const session = request.result;

                if (!session) {
                    resolve(null);
                }

                // @ts-ignore
                resolve(transformer.reverseTransform(session));
            };

            // @ts-ignore
            request.onerror = () => {
                console.log("Load session error.");
            };
        });
    }

    async all(internalAccount: string): Promise<Session[]> {
        if (this.db === null) {
            return [];
        }

        const store = this.db
            .transaction(DEPOSIT_SESSION_STORE)
            .objectStore(DEPOSIT_SESSION_STORE);

        try {
            const request = await store.getAll();
            const sessions = [];

            // @ts-ignore
            for (const session of request) {
                if (session.internalAccount !== internalAccount) {
                    continue;
                }
                sessions.push(transformer.reverseTransform(session));
            }

            sessions.sort((a, b) => {
                if (a.timeLock > b.timeLock) {
                    return -1;
                }
                if (a.timeLock < b.timeLock) {
                    return 1;
                }
                return 0;
            });

            console.log(sessions);

            // @ts-ignore
            return sessions;
        } catch (e) {
            console.log("Load sessions error.", e);
            return [];
        }
    }

    async save(session: Session): Promise<boolean> {
        if (this.db === null) {
            return false;
        }

        const tx = this.db.transaction(DEPOSIT_SESSION_STORE, "readwrite");
        const store = tx.objectStore(DEPOSIT_SESSION_STORE);

        if (store.put === undefined) {
            return false;
        }

        await Promise.all([store.put(transformer.transform(session)), tx.done]);

        return true;
    }
}
