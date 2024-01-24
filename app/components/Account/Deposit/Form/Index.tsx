import React from "react";
import useLoadEESSettings from "../../EES/Hooks/useLoadEESSettings";
import DepositForm from "./Form";
// @ts-ignore
import Translate from "react-translate-component";

//TODO::check existing payment
export default function Index() {
    const [settings, error] = useLoadEESSettings();

    if (error) {
        return (
            <div className="ees-bridge-is-unavailable">
                <Translate content={"deposit.form.ees_bridge_is_unavailable"} />
            </div>
        );
    }

    if (null === settings) {
        return <div>Loading...</div>;
    }

    return <DepositForm settings={settings} />;
}
