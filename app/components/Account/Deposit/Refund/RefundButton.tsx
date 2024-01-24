import React from "react";
// @ts-ignore
import Translate from "react-translate-component";
// @ts-ignore
import {Button, Notification} from "bitshares-ui-style-guide";
import MakeDepositRefundHandler from "../../../../Context/EES/Application/Command/MakeDepositRefund/MakeDepositRefundHandler";
import MakeDepositRefund from "../../../../Context/EES/Application/Command/MakeDepositRefund/MakeDepositRefund";

interface Props {
    sessionId: string;
    contractAddress: string;
    refresh: () => void;
}

function RefundButton({sessionId, contractAddress, refresh}: Props) {
    const [isRefunding, setIsRefunding] = React.useState<boolean>(false);

    async function onClick() {
        const command = new MakeDepositRefund(sessionId, contractAddress);
        const handler = MakeDepositRefundHandler.create();
        setIsRefunding(true);

        try {
            await handler.execute(command);
            Notification.success({
                message: <Translate content={"deposit.refund.successful"} />
            });
            refresh();
        } catch (e) {
            Notification.error({
                message: (e as Error).message
            });
            console.error(e);
        }

        setIsRefunding(false);
    }

    return (
        <>
            <Button type="primary" onClick={onClick} disabled={isRefunding}>
                <Translate content="deposit.refund.button" />
            </Button>
            {isRefunding && (
                <Translate
                    className={"warning-message"}
                    component="p"
                    content={"deposit.refund.pending"}
                />
            )}
        </>
    );
}

export default RefundButton;
