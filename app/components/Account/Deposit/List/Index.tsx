import React from "react";
// @ts-ignore
import {Link, useRouteMatch} from "react-router-dom";
// @ts-ignore
import Translate from "react-translate-component";
import Sessions from "./Sessions";
import useLoadEESSettings from "../../EES/Hooks/useLoadEESSettings";

export default function Deposits() {
    const {url} = useRouteMatch();
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

    return (
        <>
            <div className="grid-content sessions">
                <div className="actions">
                    <Link to={`${url}/new`} className="button primary">
                        <span>
                            <Translate content="deposit.title" />
                        </span>
                    </Link>
                </div>
                <Sessions settings={settings} />
            </div>
        </>
    );
}
