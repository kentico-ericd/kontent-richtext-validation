"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentComponentElement = void 0;
var content_1 = require("../content");
var ContentComponentElement = /** @class */ (function () {
    function ContentComponentElement(itemId, typeId, componentElements) {
        this.id = itemId;
        this.type = new content_1.ContentComponentTypeReference(typeId);
        this.componentElements = componentElements;
    }
    return ContentComponentElement;
}());
exports.ContentComponentElement = ContentComponentElement;
