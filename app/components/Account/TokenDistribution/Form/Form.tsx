import React, {useState} from "react";
// @ts-ignore
import {connect} from "alt-react";
// @ts-ignore
import Translate from "react-translate-component";
// @ts-ignore
import {Form, Button, Select} from "bitshares-ui-style-guide";
// @ts-ignore
import AccountStore from "../../../../stores/AccountStore";
import {tokenDistributionHandler} from "../../../../Context/TokenDistributionService";
import TokenDistributionRequest from "../../../../Context/TokenDistributionService/Command/TokenDistributionRequest";
import {TokenDistributionAPI} from "../../../../api/apiConfig";
import moment from "moment";
import ExternalWalletButton from "../../../ExternalWalletButton/ExternalWalletButton";
import counterpart from "counterpart";

interface Props {
    selectedAccountName: string;
    ethereumAddresses: string[];
}

interface WrappedProps {
    selectedAccountName: string;
}

function TokenDistributionForm({
    selectedAccountName,
    ethereumAddresses
}: Props) {
    const [ethereumAddress, setEthereumAddress] = useState<string>(
        ethereumAddresses[0]
    );
    const [error, setError] = useState<string>("");

    let phrase = "";
    phrase = TokenDistributionAPI.PHRASE;
    phrase = phrase.replace("{RQRX_USER_NAME}", selectedAccountName);
    phrase = phrase.replace("{ETH_WALLET}", ethereumAddress);
    phrase = phrase.replace(
        "{DATE}",
        moment()
            .utc()
            .format("YYYY-MM-DD")
    );

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        setError("");
        const command = new TokenDistributionRequest(
            selectedAccountName,
            ethereumAddress,
            phrase
        );
        try {
            await tokenDistributionHandler.execute(command);
        } catch (e) {
            setError("token_distribution.error");
        }
    }

    return (
        <Form onSubmit={handleSubmit} className="token-distribution-form">
            <div className="text-center">
                <Translate content="token_distribution.title" component="h4" />
            </div>
            <div className="text-center">{phrase}</div>
            <Form.Item>
                <Select
                    value={ethereumAddress}
                    placeholder={counterpart.translate(
                        "token_distribution.select_ethereum_address"
                    )}
                    onChange={(value: any) => setEthereumAddress(value)}
                >
                    {ethereumAddresses.map(address => (
                        <Select.Option key={address} value={address}>
                            {address}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item>
                {error && (
                    <div className="text-center">
                        <Translate
                            content={error}
                            className={"error-message"}
                        />
                    </div>
                )}
                <div className="text-center">
                    <Button type="primary" htmlType="submit">
                        <Translate content="token_distribution.claim" />
                    </Button>
                </div>
            </Form.Item>
        </Form>
    );
}

const TokenDistributionFormWrapped = Form.create({
    name: "tokenDistributionForm"
})(({selectedAccountName}: WrappedProps) => (
    <>
        <ExternalWalletButton
            content={(currentAddress, addresses) => (
                <TokenDistributionForm
                    selectedAccountName={selectedAccountName}
                    ethereumAddresses={addresses}
                />
            )}
        ></ExternalWalletButton>
    </>
));

export default connect(TokenDistributionFormWrapped, {
    listenTo() {
        return [AccountStore];
    },
    getProps(props: any) {
        return {
            selectedAccountName: AccountStore.getState().currentAccount
        };
    }
});
