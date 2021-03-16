"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendText = void 0;
function appendText(text, append) {
    for (var _i = 0, append_1 = append; _i < append_1.length; _i++) {
        var character = append_1[_i];
        switch (character) {
            case '&':
                text += "&amp;";
                break;
            case '<':
                text += "&lt;";
                break;
            case '>':
                text += "&gt;";
                break;
            case '\u00A0':
                text += "&nbsp;";
                break;
            default:
                text += character;
                break;
        }
    }
    return text;
}
exports.appendText = appendText;
//# sourceMappingURL=appendText.js.map