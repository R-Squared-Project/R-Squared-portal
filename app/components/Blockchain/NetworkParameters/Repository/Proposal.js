import {Apis} from "@revolutionpopuli/revpopjs-ws";
import WalletDb from "../../../../stores/WalletDb";
import WalletApi from "../../../../api/WalletApi";
import {OrderedMap} from "immutable";

class ProposalRepository {
    async load() {
        return {
            name: {
                name: "name",
                value: "value",
                parameters: new OrderedMap({
                    parameter1: 50,
                    parameter2: "New value"
                })
            },
            name2: {
                name: "name2",
                value: "value2",
                parameters: new OrderedMap({
                    parameter1: 100,
                    parameter2: "New value"
                })
            }
        };

        // const data = (
        //     await Apis.instance()
        //         .db_api()
        //         .exec("get_proposed_transactions", [])
        // ).parameters;
        //
        // const parametersKeys = Object.keys(data);
        // const parameters = {};
        //
        // parametersKeys.map(name => {
        //     parameters[name] = {
        //         name,
        //         value: data[name]
        //     };
        // });
        //
        // return parameters;
    }

    async create(parameters) {
        let transaction = WalletApi.new_transaction();
        transaction.add_type_operation(
            "committee_member_update_global_parameters",
            {
                new_parameters: parameters
            }
        );
        transaction.set_required_fees();

        WalletDb.process_transaction(transaction, null, true);
        // .then(result => {
        //
        // })
        // .catch(error => {
        //     console.error("asset settle error: ", error);
        //     return false;
        // });
    }

    async vote(account, proposals) {
        const transaction = WalletApi.new_transaction();
        transaction.add_type_operation("proposal_update", {
            fee_paying_account: account.id,
            proposal: proposal.name,
            active_approvals_to_add: [account.id]
        });

        const result = await WalletDb.process_transaction(
            transaction,
            null,
            true,
            neededKeys
        );

        console.log(result);
    }
}

export default new ProposalRepository();
