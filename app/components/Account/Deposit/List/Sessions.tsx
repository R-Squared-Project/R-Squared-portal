import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
// @ts-ignore
import {Table} from "bitshares-ui-style-guide";
import counterpart from "counterpart";
import {
    GetSessions,
    getSessionsHandler,
    Session
} from "../../../../Context/EES";
import {Moment} from "moment";
import Web3 from "web3";
// @ts-ignore
import {connect} from "alt-react";
import AccountStore from "../../../../stores/AccountStore";
// @ts-ignore
import Translate from "react-translate-component";
import {EESSettings} from "../../../../Context/EES/Domain/EES/RepositoryInterface";

interface Props {
    internalAccount: string;
    settings: EESSettings;
}

function Sessions({internalAccount, settings}: Props) {
    const [sessions, setSessions] = useState<Session[]>([]);

    useEffect(() => {
        async function loadSessions() {
            const query = new GetSessions(internalAccount);
            const sessionsOrError = await getSessionsHandler.execute(query);

            if (sessionsOrError.isFailure()) {
                return <p>{counterpart.translate("deposit.session.empty")}</p>;
            }

            setSessions(sessionsOrError.value);
        }

        loadSessions();
    }, []);

    const columns = [
        {
            title: counterpart.translate("deposit.session.fields.id.label"),
            dataIndex: "id",
            render: (id: string) => <Link to={`/deposit/${id}`}>{id}</Link>
        },
        {
            title: counterpart.translate("deposit.session.fields.value.label"),
            dataIndex: "value",
            render: (value: string) => `${Web3.utils.fromWei(value)} ETH`
        },
        {
            title: counterpart.translate(
                "deposit.session.fields.time_lock.label"
            ),
            dataIndex: "timeLock",
            render: (timeLock: Moment) => timeLock.format()
        },
        {
            title: counterpart.translate("deposit.session.fields.status.label"),
            dataIndex: "status",
            render: (status: number, record: Session) => {
                if (record.isReadyToRefund()) {
                    return (
                        <Link
                            className="button primary"
                            to={`/deposit/${record.id}`}
                        >
                            <Translate content="deposit.refund.button" />
                        </Link>
                    );
                }

                return counterpart(
                    `deposit.session.fields.status.list.${status}`
                );
            }
        }
    ];

    if (sessions.length === 0) {
        return <p>{counterpart.translate("deposit.session.empty")}</p>;
    }

    return <Table columns={columns} dataSource={sessions} />;
}

export default connect(Sessions, {
    listenTo() {
        return [AccountStore];
    },
    getProps(props: any) {
        return {
            internalAccount: AccountStore.getState().currentAccount
        };
    }
});
