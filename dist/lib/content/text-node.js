"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextNode = void 0;
var TextNode = /** @class */ (function () {
    function TextNode(textContent) {
        if (textContent === void 0) { textContent = ''; }
        this.childNodes = [];
        this.textContent = textContent;
    }
    return TextNode;
}());
exports.TextNode = TextNode;
//# sourceMappingURL=text-node.js.map