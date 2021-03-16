"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    TokenType[TokenType["PlainText"] = 0] = "PlainText";
    TokenType[TokenType["ClosingTag"] = 1] = "ClosingTag";
    TokenType[TokenType["OpeningTagBeginning"] = 2] = "OpeningTagBeginning";
    TokenType[TokenType["AttributeName"] = 3] = "AttributeName";
    TokenType[TokenType["AttributeValue"] = 4] = "AttributeValue";
    TokenType[TokenType["OpeningTagEnd"] = 5] = "OpeningTagEnd";
    TokenType[TokenType["OpeningTagSelfClosing"] = 6] = "OpeningTagSelfClosing"; // />
})(TokenType = exports.TokenType || (exports.TokenType = {}));
//# sourceMappingURL=token-type.js.map