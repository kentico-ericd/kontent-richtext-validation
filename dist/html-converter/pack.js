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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pack = void 0;
var html_entities_1 = require("html-entities");
var html_converter_1 = require("../html-converter");
var html_parser_1 = require("../html-parser");
var content_1 = require("../content");
var Pack = /** @class */ (function (_super) {
    __extends(Pack, _super);
    function Pack() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.convertToHtml = function (content) {
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
        _this.visitElements = function (elements, text) {
            for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
                var element = elements_1[_i];
                switch (element.constructor) {
                    case content_1.ParagraphElement:
                        text += _this.visitParagraph(element, text);
                        break;
                    case content_1.HeadingElement:
                        text += _this.visitHeading(element, text);
                        break;
                    case content_1.ListElement:
                        text += _this.visitList(element, text);
                        break;
                    case content_1.TableElement:
                        text += _this.visitTable(element, text);
                        break;
                    case content_1.ImageElement:
                        text += _this.visitImage(element, text);
                        break;
                    case content_1.ContentModuleElement:
                        text += _this.visitContentModule(element, text);
                        break;
                    case content_1.ContentComponentElement:
                        text += _this.visitContentComponent(element, text);
                        break;
                    default: throw new Error("Unrecognized content element type: " + typeof element + "\"");
                }
            }
            return text;
        };
        _this.appendIndent = function (indent, text) {
            for (var i = 0; i < indent * 2; i++) {
                text += ' ';
            }
            return text;
        };
        _this.visitImage = function (element, text) {
            return text + ("<figure data-asset-id=\"" + element.id + "\"><img src=\"#\" data-asset-id=\"" + element.id + "\"></figure>\n");
        };
        _this.visitContentModule = function (element, text) {
            return text + ("<object type=\"application/kenticocloud\" data-type=\"item\" data-id=\"" + element.id + "\"></object>\n");
        };
        _this.visitContentComponent = function (element, text) {
            return text + ("<object type=\"application/kenticocloud\" data-type=\"component\" data-id=\"" + element.id + "\"></object>\n");
        };
        _this.visitTable = function (element, text) {
            text += '<table><tbody>\n';
            for (var _i = 0, _a = element.rows; _i < _a.length; _i++) {
                var row = _a[_i];
                text += _this.visitTableRow(row, text);
            }
            return text + '</tbody></table>\n';
        };
        _this.visitTableRow = function (row, text) {
            text += _this.appendIndent(1, text);
            text += '<tr>';
            for (var _i = 0, _a = row.cells; _i < _a.length; _i++) {
                var cell = _a[_i];
                text += _this.visitTableCell(cell, text);
            }
            return text + '</tr>\n';
        };
        _this.visitTableCell = function (cell, text) {
            text += '<td>';
            text += _this.visitNestedContent(cell.childElements, text);
            return text + '</td>';
        };
        _this.visitList = function (element, text, indent) {
            if (indent === void 0) { indent = 0; }
            switch (element.type) {
                case content_1.ListTypes.Unordered: return text + _this.visitUnorderedList(element, indent, text);
                case content_1.ListTypes.Ordered: return text + _this.visitOrderedList(element, indent, text);
                default: throw new Error("Unrecognized list type: " + element.type);
            }
        };
        _this.visitUnorderedList = function (element, indent, text) {
            text += _this.appendIndent(indent, text);
            text += '<ul>\n';
            text += _this.visitListItems(element.items, indent + 1, text);
            text += _this.appendIndent(indent, text);
            return text + '</ul>\n';
        };
        _this.visitOrderedList = function (element, indent, text) {
            text += _this.appendIndent(indent, text);
            text += '<ol>\n';
            text += _this.visitListItems(element.items, indent + 1, text);
            text += _this.appendIndent(indent, text);
            return text + '</ol>\n';
        };
        _this.visitListItems = function (items, indent, text) {
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var item = items_1[_i];
                if (item instanceof content_1.ListItemElement) {
                    text += _this.appendIndent(indent, text);
                    text += '<li>';
                    text += _this.visitElementNodes(item.childNodes, text);
                    if (item.nestedList) {
                        text += '\n';
                        text += _this.visitList(item.nestedList, text, indent + 1);
                        text += _this.appendIndent(indent, text);
                    }
                    text += '</li>\n';
                }
                else if (item instanceof content_1.ListElement) {
                    text += _this.visitList(item, text, indent);
                }
                else
                    throw new Error("Unrecognized list item type: " + typeof item);
            }
            return text;
        };
        _this.visitParagraph = function (element, text) {
            text += '<p>';
            text += _this.visitElementNodes(element.childNodes, text);
            return text + '</p>\n';
        };
        _this.visitHeading = function (element, text) {
            text += "<h" + element.level + ">";
            text += _this.visitElementNodes(element.childNodes, text);
            return text + ("</h" + element.level + ">\n");
        };
        _this.visitNestedContent = function (elements, text) {
            if (elements.length === 1) {
                // Single paragraph content does not include the wrapping P tag in the output for backward compatibility
                var singleElement = elements[0];
                switch (singleElement) {
                    case content_1.ParagraphElement:
                        return text + _this.visitElementNodes(singleElement.childNodes, text);
                }
            }
            return text + _this.visitElements(elements, text);
        };
        _this.visitElementNodes = function (nodes, text) {
            if (nodes.length === 0 || (nodes.length === 1 && nodes[0] instanceof content_1.TextNode && nodes[0].textContent.length === 0)) {
                return text + '<br/>';
            }
            else {
                return text + _this.visitNodes(nodes, text);
            }
        };
        _this.visitNodes = function (nodes, text) {
            for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                var node = nodes_1[_i];
                switch (node.constructor) {
                    case content_1.TextNode:
                        text += _this.visitTextNode(node, text);
                        break;
                    case content_1.LineBreakNode:
                        text += _this.visitLineBreakNode(text);
                        break;
                    case content_1.InlineStyleNode:
                        text += _this.visitInlineStyleNode(node, text);
                        break;
                    case content_1.EntityNode:
                        text += _this.visitEntityNode(node, text);
                        break;
                    default: throw new Error("Unrecognized node type: " + typeof node);
                }
            }
            return text;
        };
        _this.visitTextNode = function (node, text) {
            return text + node.textContent;
        };
        _this.visitLineBreakNode = function (text) {
            return text + '<br/>';
        };
        _this.visitInlineStyleNode = function (node, text) {
            var tag = Pack.tagsByInlineStyle[node.style];
            if (!tag) {
                throw new Error("Unrecognized inline style: " + node.style);
            }
            text += "<" + tag + ">";
            text += _this.visitNodes(node.childNodes, text);
            return text + ("</" + tag + ">");
        };
        _this.visitEntityNode = function (node, text) {
            switch (node.constructor) {
                case content_1.WebLinkNode: return text + _this.visitWebLinkNode(node, text);
                case content_1.EmailLinkNode: return text + _this.visitEmailLinkNode(node, text);
                case content_1.ContentItemLinkNode: return text + _this.visitContentItemLinkNode(node, text);
                case content_1.AssetLinkNode: return text + _this.visitAssetLinkNode(node, text);
                default: throw new Error("Unrecognized entity type: " + typeof node);
            }
        };
        _this.visitWebLinkNode = function (node, text) {
            text += "<a href=\"" + node.url + "\"";
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
            text += _this.visitNodes(node.childNodes, text);
            return text + '</a>';
        };
        _this.visitEmailLinkNode = function (node, text) {
            text += "<a data-email-address=\"" + node.to + "\"";
            if (!html_parser_1.isNullOrWhitespace(node.subject)) {
                text += "data-email-subject=\"" + node.subject + "\"";
            }
            text += '>';
            text += _this.visitNodes(node.childNodes, text);
            return text + '</a>';
        };
        _this.visitContentItemLinkNode = function (node, text) {
            text += "<a data-item-id=\"" + node.id + "\">";
            text += _this.visitNodes(node.childNodes, text);
            return text + '</a>';
        };
        _this.visitAssetLinkNode = function (node, text) {
            text += "<a data-asset-id=\"" + node.id + "\">";
            text += _this.visitNodes(node.childNodes, text);
            return text + '</a>';
        };
        return _this;
    }
    Pack.tagsByInlineStyle = (_a = {},
        _a[content_1.InlineStyle.Bold] = 'strong',
        _a[content_1.InlineStyle.Italic] = 'em',
        _a[content_1.InlineStyle.Subscript] = 'sub',
        _a[content_1.InlineStyle.Superscript] = 'sup',
        _a[content_1.InlineStyle.Code] = 'code',
        _a);
    return Pack;
}(html_converter_1.HtmlConverter));
exports.Pack = Pack;
