import { State, Token, TokenType } from '../html-parser';

export class Scanner {
    private _textContentStates: State[] = [
        State.InPlainText,
        State.InClosingTagName,
        State.InOpeningTagName,
        State.InAttributeName,
        State.InAttributeValue,
    ];

    private _tokens: Token[] = [];
    private _state: State = State.Start;
    private _text: string = '';
    private _position: number = 0;
    private _line: number = 1;
    private _column: number = 1;
    private _tokenTextPosition: number = 0;
    private _tokenStartLine: number = 1;
    private _tokenStartColumn: number = 1;

    reset = () => {
        this._state = State.Start;
        this._tokens = [];
        this._position = 0;
        this._line = 1;
        this._column = 1;
        this._tokenTextPosition = 0;
        this._tokenStartLine = 1;
        this._tokenStartColumn = 1;
    }

    scan = (input: string): Token[] => {
        this.reset();
        this._text = input;

        for (const c of this._text) {
            this.updateState(c);
            this.updatePosition(c);
        }

        this.ensureFinalState();

        return this._tokens;
    }

    private ensureFinalState = () => {
        switch (this._state) {
            case State.Start:
                return;

            case State.InPlainText:
                this.addTokenWithText(TokenType.PlainText);
                return;
        }

        throw new Error(`Unexpected end of HTML fragment (${this._line}, ${this._column})`);
    }

    private updatePosition = (c: string) => {
        this._position++;

        if (c === '\n') {
            this._line++;
            this._column = 1;
        }
        else if (c !== '\r') {
            this._column++;
        }
    }

    private updateState = (c: string) => {
        const previousState = this._state;
        let nextState = this.getNextState(previousState, c);

        if (nextState != previousState && this._textContentStates.indexOf(nextState) > -1) {
            this.beginTokenText();
        }

        this._state = nextState;
    }

    private getNextState = (state: State, c: string): State => {
        let errorMessage;

        switch (state) {
            case State.Start:
                if (c === '<') {
                    return State.TagStarted;
                }

                return State.InPlainText;

            case State.InPlainText:
                if (c === '<') {
                    this.addTokenWithText(TokenType.PlainText);
                    return State.TagStarted;
                }

                return State.InPlainText;

            case State.TagStarted:
                if (c === '/') {
                    return State.ClosingTagStarted;
                }

                if (this.isTagNameCharacter(c)) {
                    return State.InOpeningTagName;
                }

                errorMessage = 'Element name was expected.';
                break;

            case State.ClosingTagStarted:
                if (this.isTagNameCharacter(c)) {
                    return State.InClosingTagName;
                }

                errorMessage = 'Element name was expected.';
                break;

            case State.InClosingTagName:
                if (c == '>') {
                    this.addTokenWithText(TokenType.ClosingTag);
                    return State.Start;
                }

                if (this.isTagNameCharacter(c)) {
                    return State.InClosingTagName;
                }

                if (this.isWhiteSpace(c)) {
                    this.addTokenWithText(TokenType.ClosingTag);
                    return State.InClosingTag;
                }

                errorMessage = '">" character was expected.';
                break;

            case State.InClosingTag:
                if (c === '>') {
                    return State.Start;
                }

                if (this.isWhiteSpace(c)) {
                    return State.InClosingTag;
                }

                errorMessage = '">" character was expected.';
                break;

            case State.InOpeningTagName:
                if (c === '/') {
                    this.addTokenWithText(TokenType.OpeningTagBeginning);
                    return State.SelfClosingStarted;
                }

                if (c === '>') {
                    this.addTokenWithText(TokenType.OpeningTagBeginning);
                    this.finishToken(TokenType.OpeningTagEnd);
                    return State.Start;
                }

                if (this.isTagNameCharacter(c)) {
                    return State.InOpeningTagName;
                }

                if (this.isWhiteSpace(c)) {
                    this.addTokenWithText(TokenType.OpeningTagBeginning);
                    return State.InOpeningTag;
                }

                errorMessage = '">" character was expected.';
                break;

            case State.InOpeningTag:
                if (c === '/') {
                    return State.SelfClosingStarted;
                }

                if (c === '>') {
                    this.finishToken(TokenType.OpeningTagEnd);
                    return State.Start;
                }

                if (this.isWhiteSpace(c)) {
                    return State.InOpeningTag;
                }

                if (this.isAttributeNameCharacter(c)) {
                    return State.InAttributeName;
                }

                errorMessage = 'Attribute name or ">" character was expected.';
                break;

            case State.InAttributeName:
                if (c === '=') {
                    this.addTokenWithText(TokenType.AttributeName);
                    return State.AttributeAssignmentStarted;
                }

                if (c === '>') {
                    this.addTokenWithText(TokenType.AttributeName);
                    this.finishToken(TokenType.OpeningTagEnd);
                    return State.Start;
                }

                if (c === '/') {
                    this.addTokenWithText(TokenType.AttributeName);
                    return State.SelfClosingStarted;
                }

                if (this.isWhiteSpace(c)) {
                    this.addTokenWithText(TokenType.AttributeName);
                    return State.AfterAttributeName;
                }

                if (this.isAttributeNameCharacter(c)) {
                    return State.InAttributeName;
                }

                break;

            case State.AfterAttributeName:
                if (c === '/') {
                    return State.SelfClosingStarted;
                }

                if (c === '>') {
                    this.finishToken(TokenType.OpeningTagEnd);
                    return State.Start;
                }

                if (c === '=') {
                    return State.AttributeAssignmentStarted;
                }

                if (this.isWhiteSpace(c)) {
                    return State.AfterAttributeName;
                }

                if (this.isAttributeNameCharacter(c)) {
                    return State.InAttributeName;
                }

                break;

            case State.AttributeAssignmentStarted:
                if (c === '"') {
                    return State.AttributeValueStarted;
                }

                if (this.isWhiteSpace(c)) {
                    return State.AttributeAssignmentStarted;
                }

                errorMessage = 'Attribute value enclosed in double quotes (") was expected.';
                break;

            case State.AttributeValueStarted:
                if (c === '"') {
                    this.finishToken(TokenType.AttributeValue, '');
                    return State.InOpeningTag;
                }

                return State.InAttributeValue;

            case State.InAttributeValue:
                if (c === '"') {
                    this.addTokenWithText(TokenType.AttributeValue);
                    return State.InOpeningTag;
                }

                return State.InAttributeValue;

            case State.SelfClosingStarted:
                if (c === '>') {
                    this.finishToken(TokenType.OpeningTagSelfClosing);
                    return State.Start;
                }

                errorMessage = '">" character was expected.';
                break;
        }

        if (errorMessage) {
            throw new Error(`Unexpected character "${c}" at (${this._line}, ${this._column}). ${errorMessage}`);
        }

        throw new Error(`Unexpected character "${c}" at (${this._line}, ${this._column}).`);
    }

    private beginTokenText = () => {
        this._tokenTextPosition = this._position;
    }

    private addTokenWithText = (tokenType: TokenType) => {
        const tokenText = this.getTokenText();
        this.finishToken(tokenType, tokenText);
    }

    private getTokenText = (): string => {
        var length = this._position - this._tokenTextPosition;

        if (length < 0) {
            throw new Error(`The token text at position ${this._tokenTextPosition} starts after the current position (${this._position})`);
        }

        return this._text.substr(this._tokenTextPosition, length);
    }

    private isTagNameCharacter = (c: string): boolean => {
        // HTML elements all have names that only use alphanumeric ASCII characters.
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
    }

    private isControlCharacter = (c: string): boolean => {
        return /[\u0000-\u001F\u007F-\u009F]/g.test(c);
    }

    private isAttributeNameCharacter = (c: string): boolean => {
        // Attribute names must consist of one or more characters other than the space characters, 
        // U +0000 NULL, U+0022 QUOTATION MARK ("), U+0027 APOSTROPHE ('), U+003E GREATER-THAN SIGN (>), 
        // U +002F SOLIDUS (/), and U+003D EQUALS SIGN (=) characters, the control characters, 
        // and any characters that are not defined by Unicode.
        return !this.isWhiteSpace(c) && !this.isControlCharacter(c) && c != '"' && c != '\'' && c != '>' && c != '/' && c != '=';
    }

    private isWhiteSpace = (c: string): boolean => /\s/.test(c);

    private finishToken = (tokenType: TokenType, tokenText: string = '') => {
        let token = new Token(tokenType, this._tokenStartLine, this._tokenStartColumn, tokenText);

        this._tokenStartLine = this._line;
        this._tokenStartColumn = this._column;

        this._tokens.push(token);
    }
}