"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendAttribute = void 0;
function appendAttribute(text, name, value) {
    text = text + ' ' + name + '="';
    for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
        var char = value_1[_i];
        switch (char) {
            case '&':
                text += '&amp;';
                break;
            case '"':
                text += '&quot;';
                break;
            case '\u00A0':
                text += '&nbsp;';
                break;
            default:
                text += char;
                break;
        }
    }
    text += '"';
    return text;
}
exports.appendAttribute = appendAttribute;
//# sourceMappingURL=appendAttribute.js.map