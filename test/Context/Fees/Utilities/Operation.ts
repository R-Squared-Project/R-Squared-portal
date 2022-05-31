import Operation from "../../../../app/Context/Fees/Domain/Operation";
import {Fees} from "../../../../app/Context/Fees/types";
import BlockchainFeeType = Fees.BlockchainFeeType;
import BlockchainOperationType = Fees.BlockchainOperationType;
import Operations = Fees.OperationsType;
import {Map} from "immutable";

type NewOperationType = {
    id: number;
    name: string;
    fees?: BlockchainFeeType;
};

type NewOperationsType = NewOperationType[];

export function getOperation(
    id: number,
    name: string,
    fees: BlockchainFeeType = {}
): Operation {
    const operation = new Operation(id, name);

    for (const fee in fees) {
        operation.addFee(fee, fees[fee]);
    }

    return operation;
}

export function getOperations(newOperations: NewOperationsType): Operations {
    const operations = Map<number, Operation>().asMutable();

    for (const newOperation of newOperations) {
        const operation = getOperation(
            newOperation.id,
            newOperation.name,
            newOperation.fees ?? {}
        );

        operations.set(operation.id, operation);
    }

    return operations.asImmutable();
}

export function getBlockchainOperation(
    id: number,
    fees: BlockchainFeeType = {}
): BlockchainOperationType {
    return [id, fees];
}
