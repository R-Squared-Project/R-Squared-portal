import React from "react";
import {Route, Switch, useRouteMatch} from "react-router-dom";
import HelpContent from "../../Utility/HelpContent";
import Form from "./Form/Index";
import CenterContainer from "./../CenterContainer";
import "./../../../../app/assets/stylesheets/components/token_distribution/index.scss";
// @ts-ignore
import Translate from "react-translate-component";

export default function Index() {
    const {path} = useRouteMatch();

    return (
        <div className="token-distribution-page">
            <div className="grid-content">
                <HelpContent path={"components/TokenDistribution"} />
            </div>

            <Switch>
                <Route path={`${path}/new`} exact>
                    <CenterContainer>
                        <Form />
                    </CenterContainer>
                </Route>
                <Route path={`${path}/done`} exact>
                    <CenterContainer>
                        <div className="text-center">
                            <Translate
                                content="token_distribution.success"
                                component="h4"
                            />
                        </div>
                    </CenterContainer>
                </Route>
            </Switch>
        </div>
    );
}
