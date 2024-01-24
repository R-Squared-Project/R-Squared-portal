import {UseCaseError} from "../../../../Core/Logic/AppError";

export class SessionNotFoundError extends UseCaseError {
    constructor(id: string) {
        super(`The session with id ${id} was not found.`);
    }
}

export class SessionAlreadyRefundedError extends UseCaseError {
    constructor(id: string) {
        super(`The session with id ${id} cannot be refunded.`);
    }
}

export class RefundUnexpectedError extends UseCaseError {
    constructor(id: string, error: any) {
        super(`The session with id ${id} got unexpected error.`);
    }
}
