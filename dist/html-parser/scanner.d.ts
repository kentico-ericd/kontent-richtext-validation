import { Token } from '../html-parser';
export declare class Scanner {
    private _textContentStates;
    private _tokens;
    private _state;
    private _text;
    private _position;
    private _line;
    private _column;
    private _tokenTextPosition;
    private _tokenStartLine;
    private _tokenStartColumn;
    reset: () => void;
    scan: (input: string) => Token[];
    private ensureFinalState;
    private updatePosition;
    private updateState;
    private getNextState;
    private beginTokenText;
    private addTokenWithText;
    private getTokenText;
    private isTagNameCharacter;
    private isControlCharacter;
    private isAttributeNameCharacter;
    private isWhiteSpace;
    private finishToken;
}
