export class ReferenceContext {
    line: number;
    column: number;

    constructor(line: number, column: number) {
        this.line = line;
        this.column = column;
    }
}