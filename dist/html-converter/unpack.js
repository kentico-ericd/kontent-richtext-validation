"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unpack = void 0;
var html_converter_1 = require("../html-converter");
var html_parser_1 = require("../html-parser");
var Unpack = /** @class */ (function (_super) {
    __extends(Unpack, _super);
    function Unpack() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.convertFromHtml = function (value, contentComponents) {
            var scanner = new html_parser_1.Scanner();
            var tokens = scanner.scan(value);
            var parser = new html_parser_1.Parser(_this.strict);
            var model = parser.parse(tokens, contentComponents);
            return model;
        };
        return _this;
    }
    return Unpack;
}(html_converter_1.HtmlConverter));
exports.Unpack = Unpack;
