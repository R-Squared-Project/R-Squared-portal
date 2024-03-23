import React, {useState} from "react";
// @ts-ignore
import Translate from "react-translate-component";
// @ts-ignore
import {Apis} from "@r-squared/rsquared-js-ws";
// @ts-ignore
import {ChainStore, FetchChainObjects} from "@r-squared/rsquared-js";
import {bindToCurrentAccount} from "../../../Utility/BindToCurrentAccount";
import SessionRepository from "../../../../Context/EES/Infrastructure/SessionRepository/IndexedDBDepositSessionRepository";
import HtlcModal from "../../../Modal/HtlcModal";
import {Session} from "../../../../Context/EES";
import UnlockButton from "../../../UnlockButton/UnlockButton";

type Params = {
    session: Session;
    currentAccount: any;
    refresh: () => void;
};

const sessionRepository = new SessionRepository();

function Redeem({session, currentAccount, refresh}: Params) {
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [modalData, setModalData] = useState<any>();

    async function hideModal() {
        setIsModalVisible(false);
    }

    async function afterSuccess() {
        session.redeemed();
        await sessionRepository.save(session);
        refresh();
    }

    async function onShowModalClick() {
        await FetchChainObjects(
            ChainStore.getAccount,
            [session.internalAccount],
            undefined,
            {}
        );
        await FetchChainObjects(ChainStore.getAsset, ["1.3.1"]);

        const htlc = await Apis.instance()
            .db_api()
            .exec("get_htlc", [session.internalContract?.id]);

        await FetchChainObjects(
            ChainStore.getAccount,
            [htlc.transfer.from],
            undefined,
            {}
        );

        let fromAccount = await ChainStore.getAccount(htlc.transfer.from);

        setModalData({
            type: "redeem",
            payload: htlc,
            fromAccount: fromAccount
        });

        setIsModalVisible(true);
    }

    return (
        <UnlockButton>
            <div className="redeem">
                <button
                    className="button"
                    onClick={onShowModalClick}
                    disabled={isModalVisible}
                >
                    <Translate content="showcases.htlc.redeem" />
                </button>

                {isModalVisible ? (
                    <HtlcModal
                        isModalVisible={isModalVisible}
                        hideModal={hideModal}
                        operation={modalData}
                        fromAccount={modalData.fromAccount}
                        afterSuccess={afterSuccess}
                    />
                ) : null}
            </div>
        </UnlockButton>
    );
}

export default bindToCurrentAccount(Redeem);
