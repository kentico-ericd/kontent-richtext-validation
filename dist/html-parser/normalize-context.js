"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NormalizeContext = void 0;
var NormalizeContext = /** @class */ (function () {
    function NormalizeContext(lastTextNode, hasContent, hasTrailingWhitespace) {
        var _this = this;
        this.setLastText = function (text) {
            if (_this.lastTextNode)
                _this.lastTextNode.textContent = text;
        };
        this.lastTextNode = lastTextNode;
        this.hasContent = hasContent;
        this.hasTrailingWhitespace = hasTrailingWhitespace;
    }
    return NormalizeContext;
}());
exports.NormalizeContext = NormalizeContext;
