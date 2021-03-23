"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebLinkNode = void 0;
var content_1 = require("../content");
var WebLinkNode = /** @class */ (function () {
    function WebLinkNode(url, target, title) {
        this.childNodes = [];
        this.target = content_1.WebLinkTargets.Self;
        this.url = url;
        this.target = target;
        this.title = title;
    }
    return WebLinkNode;
}());
exports.WebLinkNode = WebLinkNode;