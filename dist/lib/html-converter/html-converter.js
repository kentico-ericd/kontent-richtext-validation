"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlConverter = void 0;
var html_entities_1 = require("html-entities");
var html_converter_1 = require("../html-converter");
var html_parser_1 = require("../html-parser");
var content_1 = require("../content");
var HtmlConverter = /** @class */ (function () {
    function HtmlConverter(strict) {
        var _this = this;
        this.convertToHtml = function (content) {
            var text = '';
            text = _this.visitElements(content.elements, text);
            if (text.length === 0) {
                text += '<p><br/></p>';
            }
            else {
                // Remove the trailing end of line
                text = text.slice(0, -1);
            }
            return text;
        };
        this.convertFromHtml = function (value, contentComponents) {
            var scanner = new html_parser_1.Scanner();
            var tokens = scanner.scan(value);
            var parser = new html_parser_1.Parser(_this.strict);
            var model = parser.parse(tokens, contentComponents);
            return model;
        };
        this.visitElements = function (elements, text) {
            for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
                var element = elements_1[_i];
                switch (element.constructor) {
                    case content_1.ParagraphElement:
                        text = _this.visitParagraph(element, text);
                        break;
                    case content_1.HeadingElement:
                        text = _this.visitHeading(element, text);
                        break;
                    case content_1.ListElement:
                        text = _this.visitList(element, text);
                        break;
                    case content_1.TableElement:
                        text = _this.visitTable(element, text);
                        break;
                    case content_1.ImageElement:
                        text = _this.visitImage(element, text);
                        break;
                    case content_1.ContentModuleElement:
                        text = _this.visitContentModule(element, text);
                        break;
                    case content_1.ContentComponentElement:
                        text = _this.visitContentComponent(element, text);
                        break;
                    default: throw new Error("Unrecognized content element type: " + typeof element + "\"");
                }
            }
            return text;
        };
        this.appendIndent = function (indent, text) {
            for (var i = 0; i < indent * 2; i++) {
                text += ' ';
            }
            return text;
        };
        this.visitImage = function (element, text) {
            return text + ("<figure data-asset-id=\"" + element.id + "\"><img src=\"#\" data-asset-id=\"" + element.id + "\"></figure>\n");
        };
        this.visitContentModule = function (element, text) {
            return text + ("<object type=\"application/kenticocloud\" data-type=\"item\" data-id=\"" + element.id + "\"></object>\n");
        };
        this.visitContentComponent = function (element, text) {
            return text + ("<object type=\"application/kenticocloud\" data-type=\"component\" data-id=\"" + element.id + "\"></object>\n");
        };
        this.visitTable = function (element, text) {
            text += '<table><tbody>\n';
            for (var _i = 0, _a = element.rows; _i < _a.length; _i++) {
                var row = _a[_i];
                text = _this.visitTableRow(row, text);
            }
            return text + '</tbody></table>\n';
        };
        this.visitTableRow = function (row, text) {
            text = _this.appendIndent(1, text);
            text += '<tr>';
            for (var _i = 0, _a = row.cells; _i < _a.length; _i++) {
                var cell = _a[_i];
                text = _this.visitTableCell(cell, text);
            }
            return text + '</tr>\n';
        };
        this.visitTableCell = function (cell, text) {
            text += '<td>';
            text = _this.visitNestedContent(cell.childElements, text);
            return text + '</td>';
        };
        this.visitList = function (element, text, indent) {
            if (indent === void 0) { indent = 0; }
            switch (element.type) {
                case content_1.ListTypes.Unordered: return _this.visitUnorderedList(element, indent, text);
                case content_1.ListTypes.Ordered: return _this.visitOrderedList(element, indent, text);
                default: throw new Error("Unrecognized list type: " + element.type);
            }
        };
        this.visitUnorderedList = function (element, indent, text) {
            text = _this.appendIndent(indent, text);
            text += '<ul>\n';
            text = _this.visitListItems(element.items, indent + 1, text);
            text = _this.appendIndent(indent, text);
            return text + '</ul>\n';
        };
        this.visitOrderedList = function (element, indent, text) {
            text = _this.appendIndent(indent, text);
            text += '<ol>\n';
            text = _this.visitListItems(element.items, indent + 1, text);
            text = _this.appendIndent(indent, text);
            return text + '</ol>\n';
        };
        this.visitListItems = function (items, indent, text) {
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var item = items_1[_i];
                if (item instanceof content_1.ListItemElement) {
                    text = _this.appendIndent(indent, text);
                    text += '<li>';
                    text = _this.visitElementNodes(item.childNodes, text);
                    if (item.nestedList) {
                        text += '\n';
                        text = _this.visitList(item.nestedList, text, indent + 1);
                        text = _this.appendIndent(indent, text);
                    }
                    text += '</li>\n';
                }
                else if (item instanceof content_1.ListElement) {
                    text = _this.visitList(item, text, indent);
                }
                else
                    throw new Error("Unrecognized list item type: " + typeof item);
            }
            return text;
        };
        this.visitParagraph = function (element, text) {
            text += '<p>';
            text = _this.visitElementNodes(element.childNodes, text);
            return text + '</p>\n';
        };
        this.visitHeading = function (element, text) {
            text += "<h" + element.level + ">";
            text = _this.visitElementNodes(element.childNodes, text);
            return text + ("</h" + element.level + ">\n");
        };
        this.visitNestedContent = function (elements, text) {
            if (elements.length === 1) {
                // Single paragraph content does not include the wrapping P tag in the output for backward compatibility
                var singleElement = elements[0];
                switch (singleElement.constructor) {
                    case content_1.ParagraphElement:
                        return _this.visitElementNodes(singleElement.childNodes, text);
                }
            }
            return _this.visitElements(elements, text);
        };
        this.visitElementNodes = function (nodes, text) {
            if (nodes.length === 0 || (nodes.length === 1 && nodes[0] instanceof content_1.TextNode && nodes[0].textContent.length === 0)) {
                return text + '<br/>';
            }
            else {
                return _this.visitNodes(nodes, text);
            }
        };
        this.visitNodes = function (nodes, text) {
            for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                var node = nodes_1[_i];
                switch (node.constructor) {
                    case content_1.TextNode:
                        text = _this.visitTextNode(node, text);
                        break;
                    case content_1.LineBreakNode:
                        text = _this.visitLineBreakNode(text);
                        break;
                    case content_1.InlineStyleNode:
                        text = _this.visitInlineStyleNode(node, text);
                        break;
                    case content_1.WebLinkNode:
                        text = _this.visitWebLinkNode(node, text);
                        break;
                    case content_1.AssetLinkNode:
                        text = _this.visitAssetLinkNode(node, text);
                        break;
                    case content_1.ContentItemLinkNode:
                        text = _this.visitContentItemLinkNode(node, text);
                        break;
                    case content_1.EmailLinkNode:
                        text = _this.visitEmailLinkNode(node, text);
                        break;
                    default: throw new Error("Unrecognized node type: " + typeof node);
                }
            }
            return text;
        };
        this.visitTextNode = function (node, text) {
            return html_converter_1.appendText(text, node.textContent);
        };
        this.visitLineBreakNode = function (text) {
            return text + '<br/>';
        };
        this.visitInlineStyleNode = function (node, text) {
            var tag = HtmlConverter.tagsByInlineStyle[node.style];
            if (!tag) {
                throw new Error("Unrecognized inline style: " + node.style);
            }
            text += "<" + tag + ">";
            text = _this.visitNodes(node.childNodes, text);
            return text + ("</" + tag + ">");
        };
        this.visitWebLinkNode = function (node, text) {
            text += '<a';
            text = html_converter_1.appendAttribute(text, 'href', node.url);
            switch (node.target) {
                case content_1.WebLinkTargets.Self: break;
                case content_1.WebLinkTargets.Blank:
                    text += ' data-new-window="true"';
                    break;
                default: throw new Error("Unrecognized URL link target: " + node.target);
            }
            if (!html_parser_1.isNullOrWhitespace(node.title)) {
                text += " title=\"" + html_entities_1.encode(node.title) + "\"";
            }
            text += '>';
            text = _this.visitNodes(node.childNodes, text);
            return text + '</a>';
        };
        this.visitEmailLinkNode = function (node, text) {
            text += '<a';
            text = html_converter_1.appendAttribute(text, 'data-email-address', node.to);
            if (node.subject && node.subject !== '') {
                text = html_converter_1.appendAttribute(text, 'data-email-subject', node.subject);
            }
            text += '>';
            text = _this.visitNodes(node.childNodes, text);
            return text + '</a>';
        };
        this.visitContentItemLinkNode = function (node, text) {
            text += "<a data-item-id=\"" + node.id + "\">";
            text = _this.visitNodes(node.childNodes, text);
            return text + '</a>';
        };
        this.visitAssetLinkNode = function (node, text) {
            text += "<a data-asset-id=\"" + node.id + "\">";
            text = _this.visitNodes(node.childNodes, text);
            return text + '</a>';
        };
        this.strict = strict;
    }
    HtmlConverter.tagsByInlineStyle = (_a = {},
        _a[content_1.InlineStyle.Bold] = 'strong',
        _a[content_1.InlineStyle.Italic] = 'em',
        _a[content_1.InlineStyle.Subscript] = 'sub',
        _a[content_1.InlineStyle.Superscript] = 'sup',
        _a[content_1.InlineStyle.Code] = 'code',
        _a);
    return HtmlConverter;
}());
exports.HtmlConverter = HtmlConverter;
//# sourceMappingURL=html-converter.js.map