import React from "react";
// @ts-ignore
import Translate from "react-translate-component";
import {Link, useRouteMatch} from "react-router-dom";
import Icon from "../../../Icon/Icon";

export default function Selector() {
    const {url} = useRouteMatch();

    return (
        <div className="deposit-selector">
            <div className="text-center">
                <Translate content="deposit.selector.title" component="h4" />
            </div>
            <div className="deposit-selector__types">
                <Link
                    to={`${url}/metamask`}
                    className="deposit-selector__type deposit-selector__type_metamask"
                >
                    <Icon name="metamask" title="deposit.selector.metamask" />
                    <Translate content="deposit.selector.metamask" />
                </Link>
                <Link to={`${url}/manually`} className="deposit-selector__type">
                    <Icon name="keyboard" title="deposit.selector.manually" />
                    <Translate content="deposit.selector.manually" />
                </Link>
            </div>
        </div>
    );
}