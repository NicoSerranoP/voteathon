export class InvalidProofError extends Error {
    constructor(message: string, stack?: string) {
        super('InvalidProofError')
        this.message = message
        this.stack = stack
    }
}
