import {ChainStore} from "@r-squared/rsquared-js";
import React from "react";
import Translate from "react-translate-component";
import AccountSelector from "../Account/AccountSelector";
import AccountActions from "actions/AccountActions";
import counterpart from "counterpart";
import {Modal, Button, Input, Select, Form} from "bitshares-ui-style-guide";
import Icon from "../Icon/Icon";
import {PublicKey} from "@r-squared/rsquared-js";
import utils from "common/utils";

class UpdateWitnessesModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState(props);
    }

    getInitialState(props) {
        return {
            witnessAccount: props.account,
            signingKey: "",
            url: ""
        };
    }

    shouldComponentUpdate(np, ns) {
        return (
            this.state.url !== ns.visible ||
            this.props.visible !== np.visible ||
            this.state.signingKey !== ns.signingKey ||
            this.state.witnessAccount !== ns.witnessAccount
        );
    }

    onUpdateWitness() {
        const {witnessAccount, signingKey, url} = this.state;
        const {account} = this.props;

        if (witnessAccount && signingKey) {
            let witnessObject = ChainStore.getWitnessById(account.get("id"));
            if (witnessObject) {
                AccountActions.updateWitness({
                    witness: witnessObject,
                    account: witnessAccount,
                    url,
                    signingKey
                });
            }
        }
        this.props.hideModal();
    }

    onChangeCommittee(account) {
        this.setState({
            witnessAccount: account
        });
    }

    onMemoKeyChanged(e) {
        this.setState({
            signingKey: e.target.value
        });
    }

    onUrlChanged(e) {
        this.setState({
            url: utils.sanitize(e.target.value.toLowerCase())
        });
    }

    isValidPubKey = value => {
        return !PublicKey.fromPublicKeyString(value);
    };

    render() {
        const {witnessAccount, signingKey, url} = this.state;

        return (
            <Modal
                title={counterpart.translate("modal.witness.update_witness")}
                onCancel={this.props.hideModal}
                visible={this.props.visible}
                footer={[
                    <Button
                        key="submit"
                        type="primary"
                        onClick={this.onUpdateWitness.bind(this)}
                    >
                        {counterpart.translate("modal.witness.update_confirm")}
                    </Button>,
                    <Button
                        key="cancel"
                        style={{marginLeft: "8px"}}
                        onClick={this.props.hideModal}
                    >
                        {counterpart.translate("modal.cancel")}
                    </Button>
                ]}
            >
                <Form className="full-width" layout="vertical">
                    <AccountSelector
                        label="modal.witness.witness_account"
                        accountName={
                            (witnessAccount && witnessAccount.get("name")) ||
                            account.get("name")
                        }
                        account={witnessAccount}
                        onAccountChanged={this.onChangeCommittee.bind(this)}
                        size={35}
                        typeahead={true}
                    />
                    <Translate
                        content="modal.witness.text"
                        unsafe
                        component="p"
                    />
                    <Form.Item
                        label={counterpart.translate("modal.witness.url")}
                    >
                        <Input
                            value={url}
                            onChange={this.onUrlChanged.bind(this)}
                            placeholder={counterpart.translate(
                                "modal.witness.web_example"
                            )}
                        />
                    </Form.Item>
                    <Form.Item
                        label={counterpart.translate(
                            "modal.witness.public_signing_key"
                        )}
                    >
                        {this.isValidPubKey(signingKey) ? (
                            <label
                                className="right-label"
                                style={{
                                    marginTop: "-30px",
                                    position: "static"
                                }}
                            >
                                <Translate content="modal.witness.invalid_key" />
                            </label>
                        ) : null}

                        <Input
                            addonBefore={
                                <Icon name="key" title="icons.key" size="1x" />
                            }
                            value={signingKey}
                            onChange={this.onMemoKeyChanged.bind(this)}
                            placeholder={counterpart.translate(
                                "modal.witness.enter_public_signing_key"
                            )}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

export default UpdateWitnessesModal;