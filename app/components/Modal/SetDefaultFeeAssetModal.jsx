import React from "react";
import PropTypes from "prop-types";
import counterpart from "counterpart";
import Translate from "react-translate-component";
import SettingsActions from "actions/SettingsActions";
import {ChainStore} from "@r-squared/rsquared-js";
import {connect} from "alt-react";
import {Link} from "react-router-dom";
import {Table, Button, Radio, Modal, Checkbox} from "bitshares-ui-style-guide";
import SettingsStore from "stores/SettingsStore";
import AccountStore from "stores/AccountStore";

class SetDefaultFeeAssetModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            useByDefault: props.forceDefault ? true : false,
            selectedAssetId: props.current_asset,
            balances: {}
        };
    }

    _updateStateForAccount() {
        const balances = this.props.currentAccount.get("balances").toJS();
        this.setState({
            balances: Object.keys(balances).reduce((result, asset_id) => {
                const balanceObject = ChainStore.getObject(balances[asset_id]);
                result[asset_id] = balanceObject.get("balance");
                return result;
            }, {})
        });
    }

    componentDidMount() {
        this._updateStateForAccount();
    }

    componentDidUpdate(prevProps) {
        const accountChanged =
            this.props.account &&
            prevProps.account.get("id") !== this.props.account.get("id");
        if (accountChanged) {
            if (Object.keys(this.state.balances).length === 0) {
                this._updateStateForAccount();
            }
        }
        if (
            this.props.current_asset &&
            prevProps.current_asset !== this.props.current_asset
        ) {
            this.setState({
                selectedAssetId: this.props.current_asset
            });
        }
    }

    _onSelectedAsset(event) {
        if (event.target.checked) {
            this.setState({selectedAssetId: event.target.value});
        }
    }

    _getAssetsRows(assets) {
        return assets
            .filter(item => {
                return !!item && item.balance > 0 && !!item.asset;
            })
            .map(assetInfo => {
                return {
                    id: assetInfo.asset.get("id"),
                    key: assetInfo.asset.get("id"),
                    asset: assetInfo.asset.get("symbol"),
                    link: `/asset/${assetInfo.asset.get("symbol")}`,
                    balance:
                        assetInfo.balance /
                        Math.pow(10, assetInfo.asset.get("precision")),
                    fee: assetInfo.fee
                };
            });
    }

    onSubmit() {
        const {selectedAssetId, useByDefault} = this.state;
        this.props.onChange(selectedAssetId);
        if (useByDefault) {
            SettingsActions.changeSetting({
                setting: "fee_asset",
                value: ChainStore.getAsset(selectedAssetId).get("symbol")
            });
        }
        this.props.close();
    }

    _getColumns() {
        const symbolSorter = (a, b) => {
            if (a.asset == "RQRX" || b.asset == "RQRX") {
                return a.asset == "RQRX" ? 1 : -1;
            } else if (
                ["USD", "CNY", "EUR"].includes(a.asset) !==
                ["USD", "CNY", "EUR"].includes(b.asset)
            ) {
                return ["USD", "CNY", "EUR"].includes(a.asset) ? 1 : -1;
            }
            return a.asset < b.asset;
        };
        const columns = [
            {
                key: "id",
                title: "",
                render: asset => (
                    <Radio
                        onChange={this._onSelectedAsset.bind(this)}
                        checked={this.state.selectedAssetId === asset.id}
                        value={asset.id}
                    />
                )
            },
            {
                key: "asset",
                title: counterpart.translate("account.asset"),
                align: "left",
                sorter: symbolSorter,
                defaultSortOrder: "descend",
                render: asset => <Link to={asset.link}>{asset.asset}</Link>
            },
            {
                key: "balance",
                title: counterpart.translate("exchange.balance"),
                align: "right",
                render: asset => <span>{asset.balance}</span>
            }
        ];
        if (this.props.displayFees) {
            columns.push({
                key: "fee",
                title: counterpart.translate("account.transactions.fee"),
                align: "right",
                render: asset => <span>{asset.fee}</span>
            });
        }
        return columns;
    }

    render() {
        let assets = [];
        if (this.state.balances) {
            assets = Object.keys(this.state.balances).map(asset_id => ({
                asset: ChainStore.getAsset(asset_id),
                balance: this.state.balances[asset_id]
            }));
        }
        let dataSource = this._getAssetsRows(assets);
        const footer = (
            <div key="buttons" style={{position: "relative", left: "0px"}}>
                <Button key="cancel" onClick={this.props.close}>
                    <Translate component="span" content="transfer.cancel" />
                </Button>
                <Button
                    key="submit"
                    type="primary"
                    disabled={!this.state.selectedAssetId}
                    onClick={this.onSubmit.bind(this)}
                >
                    <Translate
                        component="span"
                        content="explorer.asset.fee_pool.use_selected_asset"
                    />
                </Button>
            </div>
        );
        return (
            <Modal
                visible={this.props.show}
                overlay={true}
                onCancel={this.props.close}
                title={counterpart.translate(
                    "explorer.asset.fee_pool.select_fee_asset"
                )}
                footer={[footer]}
            >
                <Table
                    columns={this._getColumns(this.props.displayFees)}
                    pagination={{
                        hideOnSinglePage: true,
                        pageSize: 20
                    }}
                    dataSource={dataSource}
                    footer={null}
                />

                <Checkbox
                    onClick={this._setSelectedAssetAsDefault.bind(this)}
                    disabled={this.props.forceDefault}
                    checked={this.state.useByDefault}
                    style={{paddingTop: "30px"}}
                >
                    <Translate
                        component="span"
                        content="explorer.asset.fee_pool.use_asset_as_default_fee"
                    />
                </Checkbox>
            </Modal>
        );
    }

    _setSelectedAssetAsDefault() {
        this.setState({useByDefault: !this.state.useByDefault});
    }
}

SetDefaultFeeAssetModal.propTypes = {
    // account which pays fee (defaults to current user account)
    currentAccount: PropTypes.any,
    // array of assets available
    asset_types: PropTypes.array,
    // defines if Fee column will be displayed (requires fee to be set in asset_types)
    displayFees: PropTypes.bool,
    // forces to use selected asset as default for current account
    forceDefault: PropTypes.bool,
    // asset id which should be selected on opening, if not set - user's default fee asset will be used
    current_asset: PropTypes.string,
    // Callback to handle change of selected asset
    onChange: PropTypes.func,
    // tells if modal is visible or not
    show: PropTypes.bool,
    close: PropTypes.func
};

SetDefaultFeeAssetModal.defaultProps = {
    currentAccount: null,
    asset_types: [],
    displayFees: false,
    forceDefault: false,
    current_asset: "1.3.0",
    show: false
};

SetDefaultFeeAssetModal = connect(SetDefaultFeeAssetModal, {
    listenTo() {
        return [SettingsStore, AccountStore];
    },
    getProps(props) {
        const currentAccount =
            props.currentAccount ||
            ChainStore.getAccount(AccountStore.getState().currentAccount);
        return {
            settings: SettingsStore.getState().settings,
            currentAccount
        };
    }
});
export default SetDefaultFeeAssetModal;
