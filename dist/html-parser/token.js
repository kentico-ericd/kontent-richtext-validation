"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
var html_parser_1 = require("../html-parser");
var Token = /** @class */ (function () {
    function Token(type, line, column, content) {
        var _this = this;
        if (content === void 0) { content = ''; }
        this.toReferenceContext = function () {
            return new html_parser_1.ReferenceContext(_this.line, _this.column);
        };
        this.type = type;
        this.line = line;
        this.column = column;
        this.content = content;
    }
    Token.empty = new Token(html_parser_1.TokenType.PlainText, 0, 0, '');
    return Token;
}());
exports.Token = Token;
