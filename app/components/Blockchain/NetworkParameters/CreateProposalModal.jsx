import React, {useContext, useState} from "react";
import counterpart from "counterpart";
import {Modal, Table} from "bitshares-ui-style-guide";
import proposalRepository from "./Repository/Proposal";
import NetworkParametersContext from "./Context";
import Translate from "react-translate-component";
import {isObject} from "lodash-es";
import ExpirationDate from "./CreateProposalModal/ExpirationDate";
import moment from "moment";

export default function CreateProposalModal({isVisible, close}) {
    const [expirationDate, setExpirationDate] = useState(
        moment().add(1, "days")
    );
    const [saveEmptyError, setSaveEmptyError] = useState(false);
    const {parameters} = useContext(NetworkParametersContext);

    const columns = [
        {
            key: "name",
            title: counterpart.translate("network_parameters.name"),
            dataIndex: "name"
        },
        {
            key: "value",
            title: counterpart.translate("network_parameters.value"),
            dataIndex: "value"
        },
        {
            key: "newValue",
            title: counterpart.translate("network_parameters.new_value"),
            dataIndex: "newValue"
        }
    ];

    function data() {
        return parameters
            .filter(parameter => parameter.newValue !== undefined)
            .map(parameter => {
                return {
                    key: parameter.name,
                    name: parameter.name,
                    value: !isObject(parameter.value)
                        ? parameter.value
                        : "Object",
                    newValue: parameter.newValue
                };
            })
            .toArray();
    }

    async function save() {
        const parametersToSave = parameters.filter(
            parameter => parameter.newValue !== undefined
        );

        if (parametersToSave.isEmpty()) {
            setSaveEmptyError(true);
            return;
        }

        const newParameters = parameters.map(parameter => {
            return parameter.newValue ?? parameter.value;
        });

        try {
            await proposalRepository.create(
                newParameters.toObject(),
                expirationDate.diff(moment(), "second")
            );
            close();
        } catch (e) {
            close();
        }
    }

    function onClose() {
        setSaveEmptyError(false);
        close();
    }

    return (
        <Modal
            title={counterpart.translate(
                "network_parameters.create_proposal.modal_title"
            )}
            className="create-proposal-modal"
            visible={isVisible}
            onOk={save}
            onCancel={onClose}
        >
            {saveEmptyError && (
                <div>
                    <Translate content="network_parameters.create_proposal.errors.empty" />
                </div>
            )}
            <Table
                columns={columns}
                className="list"
                dataSource={data()}
                pagination={false}
            />
            <ExpirationDate
                date={expirationDate}
                onChange={setExpirationDate}
            />
        </Modal>
    );
}
