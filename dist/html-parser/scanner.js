"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scanner = void 0;
var html_parser_1 = require("../html-parser");
var Scanner = /** @class */ (function () {
    function Scanner() {
        var _this = this;
        this._textContentStates = [
            html_parser_1.State.InPlainText,
            html_parser_1.State.InClosingTagName,
            html_parser_1.State.InOpeningTagName,
            html_parser_1.State.InAttributeName,
            html_parser_1.State.InAttributeValue,
        ];
        this._tokens = [];
        this._state = html_parser_1.State.Start;
        this._text = '';
        this._position = 0;
        this._line = 1;
        this._column = 1;
        this._tokenTextPosition = 0;
        this._tokenStartLine = 1;
        this._tokenStartColumn = 1;
        this.reset = function () {
            _this._state = html_parser_1.State.Start;
            _this._tokens = [];
            _this._position = 0;
            _this._line = 1;
            _this._column = 1;
            _this._tokenTextPosition = 0;
            _this._tokenStartLine = 1;
            _this._tokenStartColumn = 1;
        };
        this.scan = function (input) {
            _this.reset();
            _this._text = input;
            for (var _i = 0, _a = _this._text; _i < _a.length; _i++) {
                var c = _a[_i];
                _this.updateState(c);
                _this.updatePosition(c);
            }
            _this.ensureFinalState();
            return _this._tokens;
        };
        this.ensureFinalState = function () {
            switch (_this._state) {
                case html_parser_1.State.Start:
                    return;
                case html_parser_1.State.InPlainText:
                    _this.addTokenWithText(html_parser_1.TokenType.PlainText);
                    return;
            }
            throw new Error("Unexpected end of HTML fragment (" + _this._line + ", " + _this._column + ")");
        };
        this.updatePosition = function (c) {
            _this._position++;
            if (c === '\n') {
                _this._line++;
                _this._column = 1;
            }
            else if (c !== '\r') {
                _this._column++;
            }
        };
        this.updateState = function (c) {
            var previousState = _this._state;
            var nextState = _this.getNextState(previousState, c);
            if (nextState != previousState && _this._textContentStates.indexOf(nextState) > -1) {
                _this.beginTokenText();
            }
            _this._state = nextState;
        };
        this.getNextState = function (state, c) {
            var errorMessage;
            switch (state) {
                case html_parser_1.State.Start:
                    if (c === '<') {
                        return html_parser_1.State.TagStarted;
                    }
                    return html_parser_1.State.InPlainText;
                case html_parser_1.State.InPlainText:
                    if (c === '<') {
                        _this.addTokenWithText(html_parser_1.TokenType.PlainText);
                        return html_parser_1.State.TagStarted;
                    }
                    return html_parser_1.State.InPlainText;
                case html_parser_1.State.TagStarted:
                    if (c === '/') {
                        return html_parser_1.State.ClosingTagStarted;
                    }
                    if (_this.isTagNameCharacter(c)) {
                        return html_parser_1.State.InOpeningTagName;
                    }
                    errorMessage = 'Element name was expected.';
                    break;
                case html_parser_1.State.ClosingTagStarted:
                    if (_this.isTagNameCharacter(c)) {
                        return html_parser_1.State.InClosingTagName;
                    }
                    errorMessage = 'Element name was expected.';
                    break;
                case html_parser_1.State.InClosingTagName:
                    if (c == '>') {
                        _this.addTokenWithText(html_parser_1.TokenType.ClosingTag);
                        return html_parser_1.State.Start;
                    }
                    if (_this.isTagNameCharacter(c)) {
                        return html_parser_1.State.InClosingTagName;
                    }
                    if (_this.isWhiteSpace(c)) {
                        _this.addTokenWithText(html_parser_1.TokenType.ClosingTag);
                        return html_parser_1.State.InClosingTag;
                    }
                    errorMessage = '">" character was expected.';
                    break;
                case html_parser_1.State.InClosingTag:
                    if (c === '>') {
                        return html_parser_1.State.Start;
                    }
                    if (_this.isWhiteSpace(c)) {
                        return html_parser_1.State.InClosingTag;
                    }
                    errorMessage = '">" character was expected.';
                    break;
                case html_parser_1.State.InOpeningTagName:
                    if (c === '/') {
                        _this.addTokenWithText(html_parser_1.TokenType.OpeningTagBeginning);
                        return html_parser_1.State.SelfClosingStarted;
                    }
                    if (c === '>') {
                        _this.addTokenWithText(html_parser_1.TokenType.OpeningTagBeginning);
                        _this.finishToken(html_parser_1.TokenType.OpeningTagEnd);
                        return html_parser_1.State.Start;
                    }
                    if (_this.isTagNameCharacter(c)) {
                        return html_parser_1.State.InOpeningTagName;
                    }
                    if (_this.isWhiteSpace(c)) {
                        _this.addTokenWithText(html_parser_1.TokenType.OpeningTagBeginning);
                        return html_parser_1.State.InOpeningTag;
                    }
                    errorMessage = '">" character was expected.';
                    break;
                case html_parser_1.State.InOpeningTag:
                    if (c === '/') {
                        return html_parser_1.State.SelfClosingStarted;
                    }
                    if (c === '>') {
                        _this.finishToken(html_parser_1.TokenType.OpeningTagEnd);
                        return html_parser_1.State.Start;
                    }
                    if (_this.isWhiteSpace(c)) {
                        return html_parser_1.State.InOpeningTag;
                    }
                    if (_this.isAttributeNameCharacter(c)) {
                        return html_parser_1.State.InAttributeName;
                    }
                    errorMessage = 'Attribute name or ">" character was expected.';
                    break;
                case html_parser_1.State.InAttributeName:
                    if (c === '=') {
                        _this.addTokenWithText(html_parser_1.TokenType.AttributeName);
                        return html_parser_1.State.AttributeAssignmentStarted;
                    }
                    if (c === '>') {
                        _this.addTokenWithText(html_parser_1.TokenType.AttributeName);
                        _this.finishToken(html_parser_1.TokenType.OpeningTagEnd);
                        return html_parser_1.State.Start;
                    }
                    if (c === '/') {
                        _this.addTokenWithText(html_parser_1.TokenType.AttributeName);
                        return html_parser_1.State.SelfClosingStarted;
                    }
                    if (_this.isWhiteSpace(c)) {
                        _this.addTokenWithText(html_parser_1.TokenType.AttributeName);
                        return html_parser_1.State.AfterAttributeName;
                    }
                    if (_this.isAttributeNameCharacter(c)) {
                        return html_parser_1.State.InAttributeName;
                    }
                    break;
                case html_parser_1.State.AfterAttributeName:
                    if (c === '/') {
                        return html_parser_1.State.SelfClosingStarted;
                    }
                    if (c === '>') {
                        _this.finishToken(html_parser_1.TokenType.OpeningTagEnd);
                        return html_parser_1.State.Start;
                    }
                    if (c === '=') {
                        return html_parser_1.State.AttributeAssignmentStarted;
                    }
                    if (_this.isWhiteSpace(c)) {
                        return html_parser_1.State.AfterAttributeName;
                    }
                    if (_this.isAttributeNameCharacter(c)) {
                        return html_parser_1.State.InAttributeName;
                    }
                    break;
                case html_parser_1.State.AttributeAssignmentStarted:
                    if (c === '"') {
                        return html_parser_1.State.AttributeValueStarted;
                    }
                    if (_this.isWhiteSpace(c)) {
                        return html_parser_1.State.AttributeAssignmentStarted;
                    }
                    errorMessage = 'Attribute value enclosed in double quotes (") was expected.';
                    break;
                case html_parser_1.State.AttributeValueStarted:
                    if (c === '"') {
                        _this.finishToken(html_parser_1.TokenType.AttributeValue, '');
                        return html_parser_1.State.InOpeningTag;
                    }
                    return html_parser_1.State.InAttributeValue;
                case html_parser_1.State.InAttributeValue:
                    if (c === '"') {
                        _this.addTokenWithText(html_parser_1.TokenType.AttributeValue);
                        return html_parser_1.State.InOpeningTag;
                    }
                    return html_parser_1.State.InAttributeValue;
                case html_parser_1.State.SelfClosingStarted:
                    if (c === '>') {
                        _this.finishToken(html_parser_1.TokenType.OpeningTagSelfClosing);
                        return html_parser_1.State.Start;
                    }
                    errorMessage = '">" character was expected.';
                    break;
            }
            if (errorMessage) {
                throw new Error("Unexpected character \"" + c + "\" at (" + _this._line + ", " + _this._column + "). " + errorMessage);
            }
            throw new Error("Unexpected character \"" + c + "\" at (" + _this._line + ", " + _this._column + ").");
        };
        this.beginTokenText = function () {
            _this._tokenTextPosition = _this._position;
        };
        this.addTokenWithText = function (tokenType) {
            var tokenText = _this.getTokenText();
            _this.finishToken(tokenType, tokenText);
        };
        this.getTokenText = function () {
            var length = _this._position - _this._tokenTextPosition;
            if (length < 0) {
                throw new Error("The token text at position " + _this._tokenTextPosition + " starts after the current position (" + _this._position + ")");
            }
            return _this._text.substr(_this._tokenTextPosition, length);
        };
        this.isTagNameCharacter = function (c) {
            // HTML elements all have names that only use alphanumeric ASCII characters.
            return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
        };
        this.isControlCharacter = function (c) {
            return /[\u0000-\u001F\u007F-\u009F]/g.test(c);
        };
        this.isAttributeNameCharacter = function (c) {
            // Attribute names must consist of one or more characters other than the space characters, 
            // U +0000 NULL, U+0022 QUOTATION MARK ("), U+0027 APOSTROPHE ('), U+003E GREATER-THAN SIGN (>), 
            // U +002F SOLIDUS (/), and U+003D EQUALS SIGN (=) characters, the control characters, 
            // and any characters that are not defined by Unicode.
            return !_this.isWhiteSpace(c) && !_this.isControlCharacter(c) && c != '"' && c != '\'' && c != '>' && c != '/' && c != '=';
        };
        this.isWhiteSpace = function (c) { return /\s/.test(c); };
        this.finishToken = function (tokenType, tokenText) {
            if (tokenText === void 0) { tokenText = ''; }
            var token = new html_parser_1.Token(tokenType, _this._tokenStartLine, _this._tokenStartColumn, tokenText);
            _this._tokenStartLine = _this._line;
            _this._tokenStartColumn = _this._column;
            _this._tokens.push(token);
        };
    }
    return Scanner;
}());
exports.Scanner = Scanner;
