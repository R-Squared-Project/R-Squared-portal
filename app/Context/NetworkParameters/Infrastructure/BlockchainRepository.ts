// @ts-ignore
import {Apis} from "@r-squared/rsquared-js-ws";
import RepositoryInterface from "../Domain/RepositoryInterface";
import {NetworkParameters} from "../types";
import BlockchainParametersType = NetworkParameters.BlockchainParametersType;

class BlockchainRepository implements RepositoryInterface {
    async load(): Promise<BlockchainParametersType> {
        const data = (
            await Apis.instance()
                .db_api()
                .exec("get_global_properties", [])
        ).parameters;

        return data;
    }
}

export default new BlockchainRepository();
