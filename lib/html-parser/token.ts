import { ReferenceContext, TokenType } from '../html-parser';

export class Token {
    type: TokenType;
    content: string;
    line: number;
    column: number;

    constructor(type: TokenType, line: number, column: number, content: string = '') {
        this.type = type;
        this.line = line;
        this.column = column;
        this.content = content;
    }

    static empty: Token = new Token(TokenType.PlainText, 0, 0, '');

    toReferenceContext = (): ReferenceContext => {
        return new ReferenceContext(this.line, this.column);
    }
}