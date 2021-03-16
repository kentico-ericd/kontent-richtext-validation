"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var html_converter_1 = require("./html-converter");
var text = '<p><A HREF="link">text</a></p>';
var converter = new html_converter_1.HtmlConverter(true);
var model = converter.convertFromHtml(text);
var output = converter.convertToHtml(model);
//# sourceMappingURL=app.js.map