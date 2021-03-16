import { ReferenceContext, TokenType } from '../html-parser';
export declare class Token {
    type: TokenType;
    content: string;
    line: number;
    column: number;
    constructor(type: TokenType, line: number, column: number, content?: string);
    static empty: Token;
    toReferenceContext: () => ReferenceContext;
}
