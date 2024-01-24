import React from "react";
import Web3 from "web3";
// @ts-ignore
import Translate from "react-translate-component";
import counterpart from "counterpart";
import {useParams} from "react-router-dom";
import useLoadSession from "../../Deposit/Hooks/useLoadSession";
import InternalIdField from "./InternalIdField";
import ExternalExplorerField from "./ExternalExplorerField";
import CreateNewExternalContractButton from "./CreateNewExternalContractButton";
import CheckDepositContractCreatedButton from "./CheckDepositContractCreatedButton";
import Redeem from "./Redeem";
import ExternalWalletButton from "../../../ExternalWalletButton/ExternalWalletButton";
import RefundButton from "../Refund/RefundButton";
import useLoadEESSettings from "../../EES/Hooks/useLoadEESSettings";

type SelectorParams = {
    sessionId: string;
};

export default function Index() {
    const {sessionId} = useParams<SelectorParams>();
    const [session, sessionError, refreshSession] = useLoadSession(sessionId);
    const [settings, settingsError] = useLoadEESSettings();

    if (settingsError) {
        return (
            <div className="ees-bridge-is-unavailable">
                <Translate content={"deposit.form.ees_bridge_is_unavailable"} />
            </div>
        );
    }

    if (null === settings) {
        return <div>Loading...</div>;
    }

    if (!session) {
        return <p>Can&apos;t load session</p>;
    }

    return (
        <div className="session asset-card">
            <div className="card-divider">
                <Translate content="deposit.session.title" />
            </div>
            <table className="table key-value-table">
                <tbody>
                    <tr>
                        <td>
                            <Translate content="deposit.session.fields.status.label" />
                        </td>
                        <td>
                            {counterpart(
                                `deposit.session.fields.status.list.${session.status}`
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <Translate content="deposit.session.fields.internal_account.label" />
                        </td>
                        <td>{session.internalAccount}</td>
                    </tr>
                    <tr>
                        <td>
                            <Translate content="deposit.session.fields.value.label" />
                        </td>
                        <td>{Web3.utils.fromWei(session.value)} ETH</td>
                    </tr>
                    <tr>
                        <td>
                            <Translate content="deposit.session.fields.hash_lock.label" />
                        </td>
                        <td>{session.hashLock}</td>
                    </tr>
                    <tr>
                        <td>
                            <Translate content="deposit.session.fields.time_lock.label" />
                        </td>
                        <td>{session.timeLock.format()}</td>
                    </tr>
                    <InternalIdField session={session} />
                    <ExternalExplorerField session={session} />
                </tbody>
            </table>
            <div className="actions">
                {session.isCreated() && !session.isReadyToRefund() && (
                    <>
                        <CreateNewExternalContractButton
                            session={session}
                            refresh={refreshSession}
                        />
                        {/*<Instructions session={session} />*/}
                        {/*
                        <AddTransaction
                            session={session}
                            refresh={refreshSession}
                        />
                        */}
                    </>
                )}
                {session.isPaid() &&
                    !session.isExpired() &&
                    !session.isReadyToRefund() && (
                        <CheckDepositContractCreatedButton
                            sessionId={session.id}
                            refresh={refreshSession}
                        />
                    )}
                {session.isCreatedInternalBlockchain() &&
                    !session.isReadyToRefund() && (
                        <Redeem session={session} refresh={refreshSession} />
                    )}
                {session.isReadyToRefund() && (
                    <ExternalWalletButton
                        content={() => (
                            <RefundButton
                                sessionId={session.id}
                                contractAddress={
                                    settings.depositContractAddress
                                }
                                refresh={refreshSession}
                            ></RefundButton>
                        )}
                    />
                )}
            </div>
        </div>
    );
}
