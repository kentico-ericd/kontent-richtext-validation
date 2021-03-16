"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichTextData = void 0;
var content_1 = require("../lib/content");
var RichTextData = /** @class */ (function () {
    function RichTextData() {
    }
    RichTextData.textHtml = "<p>Simple paragraph.</p>\n<p> Paragraph &nbsp;&nbsp;with   spaces. </p>\n<h1>H1</h1>\n<h2>\nH2\n</h2>\n<h3>H3</h3>\n<h4>H4</h4>\n<p>Text with <strong>bold</strong> and <em>italic</em> and <em>some </em><em><strong>mixed</strong></em><em> ones</em> 2<sup>superscript</sup> x<sub>subscript</sub> and <code>code</code> and<strong><em><sup>even bold italic superscript</sup></em></strong> and<br/>\na new line.</p>\n<p>Some special characters &lt; &gt; &amp; \" ' and some more: &amp;amp;</p>\n<p>Text with a <a href=\"http://www.kentico.com\">URL link</a>, a <a href=\"http://www.kentico.com\" data-new-window=\"true\">URL link that opens in a new window</a>, a <a data-item-id=\"7819dd59-1aa3-4c03-9d32-172c40167f77\">content item link</a>, an <a data-email-address=\"info@kentico.com\" data-email-subject=\"Hi there!\">e-mail link</a> and an <a data-asset-id=\"30a3a8c2-e9ab-47c2-84f4-e470985a3444\">asset link</a>.</p>\n";
    RichTextData.imageHtml = "<figure data-asset-id=\"30a3a8c2-e9ab-47c2-84f4-e470985a3444\"><img src=\"#\" data-asset-id=\"30a3a8c2-e9ab-47c2-84f4-e470985a3444\"></figure>";
    RichTextData.imageElement = new content_1.ImageElement({ id: '30a3a8c2-e9ab-47c2-84f4-e470985a3444' });
    RichTextData.modularContentHtml = '<object type="application/kenticocloud" data-type="item" data-id="a815faa5-009e-489b-b8bb-a7f3dda0e047"></object>';
    RichTextData.modularContentElement = new content_1.ContentModuleElement({ id: 'a815faa5-009e-489b-b8bb-a7f3dda0e047' });
    RichTextData.contentComponentHtml = '<object type="application/kenticocloud" data-type="component" data-id="7819dd59-1aa3-4c03-9d32-172c40167f77"></object>';
    RichTextData.contentComponentElement = new content_1.ContentComponentElement('7819dd59-1aa3-4c03-9d32-172c40167f77', '08ab71bb-e7ef-408f-9f3b-25c525814e3b', [new content_1.RichTextContentModel([new content_1.ParagraphElement()])]);
    RichTextData.simpleTableHtml = "<table><tbody>\n    <tr><td>Name</td><td>Surname</td></tr>\n    <tr><td>\n  A\n  </td><td>B</td></tr>\n    <tr><td>C</td><td>\n  D\n  </td></tr>\n  </tbody></table>";
    RichTextData.addTextElements = function () {
        var elements = [];
        // Simple paragraph
        var pSimple = new content_1.ParagraphElement();
        pSimple.childNodes.push(new content_1.TextNode('Simple paragraph.'));
        elements.push(pSimple);
        // Paragraph with spaces
        var pWithSpaces = new content_1.ParagraphElement();
        pWithSpaces.childNodes.push(new content_1.TextNode('Paragraph   with spaces.'));
        elements.push(pWithSpaces);
        // H1
        var h1 = new content_1.HeadingElement(1);
        h1.childNodes.push(new content_1.TextNode('H1'));
        elements.push(h1);
        // H2
        var h2 = new content_1.HeadingElement(2);
        h2.childNodes.push(new content_1.TextNode('H2'));
        elements.push(h2);
        // H3
        var h3 = new content_1.HeadingElement(3);
        h3.childNodes.push(new content_1.TextNode('H3'));
        elements.push(h3);
        // H4
        var h4 = new content_1.HeadingElement(4);
        h4.childNodes.push(new content_1.TextNode('H4'));
        elements.push(h4);
        // Paragraph with inline styles
        var pWithInlineStyles = new content_1.ParagraphElement();
        pWithInlineStyles.childNodes.push(new content_1.TextNode('Text with '));
        var secondNode = new content_1.InlineStyleNode(content_1.InlineStyle.Bold);
        secondNode.childNodes.push(new content_1.TextNode('bold'));
        pWithInlineStyles.childNodes.push(secondNode);
        pWithInlineStyles.childNodes.push(new content_1.TextNode(' and '));
        var fourthNode = new content_1.InlineStyleNode(content_1.InlineStyle.Italic);
        fourthNode.childNodes.push(new content_1.TextNode('italic'));
        pWithInlineStyles.childNodes.push(fourthNode);
        pWithInlineStyles.childNodes.push(new content_1.TextNode(' and '));
        var sixthNode = new content_1.InlineStyleNode(content_1.InlineStyle.Italic);
        sixthNode.childNodes.push(new content_1.TextNode('some '));
        pWithInlineStyles.childNodes.push(sixthNode);
        var seventhNode = new content_1.InlineStyleNode(content_1.InlineStyle.Italic);
        var seventhInnerNode = new content_1.InlineStyleNode(content_1.InlineStyle.Bold);
        seventhInnerNode.childNodes.push(new content_1.TextNode('mixed'));
        seventhNode.childNodes.push(seventhInnerNode);
        pWithInlineStyles.childNodes.push(seventhNode);
        var eighthNode = new content_1.InlineStyleNode(content_1.InlineStyle.Italic);
        eighthNode.childNodes.push(new content_1.TextNode(' ones'));
        pWithInlineStyles.childNodes.push(eighthNode);
        pWithInlineStyles.childNodes.push(new content_1.TextNode(' 2'));
        var ninthNode = new content_1.InlineStyleNode(content_1.InlineStyle.Superscript);
        ninthNode.childNodes.push(new content_1.TextNode('superscript'));
        pWithInlineStyles.childNodes.push(ninthNode);
        pWithInlineStyles.childNodes.push(new content_1.TextNode(' x'));
        var tenthNode = new content_1.InlineStyleNode(content_1.InlineStyle.Subscript);
        tenthNode.childNodes.push(new content_1.TextNode('subscript'));
        pWithInlineStyles.childNodes.push(tenthNode);
        pWithInlineStyles.childNodes.push(new content_1.TextNode(' and '));
        var eleventhNode = new content_1.InlineStyleNode(content_1.InlineStyle.Code);
        eleventhNode.childNodes.push(new content_1.TextNode('code'));
        pWithInlineStyles.childNodes.push(eleventhNode);
        pWithInlineStyles.childNodes.push(new content_1.TextNode(' and'));
        var twelfthNode = new content_1.InlineStyleNode(content_1.InlineStyle.Bold);
        var twelfthInnerNode1 = new content_1.InlineStyleNode(content_1.InlineStyle.Italic);
        var twelfthInnerNode2 = new content_1.InlineStyleNode(content_1.InlineStyle.Superscript);
        twelfthInnerNode2.childNodes.push(new content_1.TextNode('even bold italic superscript'));
        twelfthInnerNode1.childNodes.push(twelfthInnerNode2);
        twelfthNode.childNodes.push(twelfthInnerNode1);
        pWithInlineStyles.childNodes.push(twelfthNode);
        pWithInlineStyles.childNodes.push(new content_1.TextNode(' and'));
        pWithInlineStyles.childNodes.push(new content_1.LineBreakNode());
        pWithInlineStyles.childNodes.push(new content_1.TextNode('a new line.'));
        elements.push(pWithInlineStyles);
        // Paragraph with special chars
        var pWithSpecialChars = new content_1.ParagraphElement();
        pWithSpecialChars.childNodes.push(new content_1.TextNode("Some special characters < > & \" ' and some more: &amp;"));
        elements.push(pWithSpecialChars);
        // Paragraph with links
        var pWithLinks = new content_1.ParagraphElement();
        pWithLinks.childNodes.push(new content_1.TextNode('Text with a '));
        var webLinkNode = new content_1.WebLinkNode('http://www.kentico.com');
        webLinkNode.childNodes.push(new content_1.TextNode('URL link'));
        pWithLinks.childNodes.push(webLinkNode);
        pWithLinks.childNodes.push(new content_1.TextNode(', a '));
        webLinkNode = new content_1.WebLinkNode('http://www.kentico.com', content_1.WebLinkTargets.Blank);
        webLinkNode.childNodes.push(new content_1.TextNode('URL link that opens in a new window'));
        pWithLinks.childNodes.push(webLinkNode);
        pWithLinks.childNodes.push(new content_1.TextNode(', a '));
        var contentItemLinkNode = new content_1.ContentItemLinkNode({ id: '7819dd59-1aa3-4c03-9d32-172c40167f77' });
        contentItemLinkNode.childNodes.push(new content_1.TextNode('content item link'));
        pWithLinks.childNodes.push(contentItemLinkNode);
        pWithLinks.childNodes.push(new content_1.TextNode(', an '));
        var emailLinkNode = new content_1.EmailLinkNode({ to: 'info@kentico.com', subject: 'Hi there!' });
        emailLinkNode.childNodes.push(new content_1.TextNode('e-mail link'));
        pWithLinks.childNodes.push(emailLinkNode);
        pWithLinks.childNodes.push(new content_1.TextNode(' and an '));
        var assetLinkNode = new content_1.AssetLinkNode({ id: '30a3a8c2-e9ab-47c2-84f4-e470985a3444' });
        assetLinkNode.childNodes.push(new content_1.TextNode('asset link'));
        pWithLinks.childNodes.push(assetLinkNode);
        pWithLinks.childNodes.push(new content_1.TextNode('.'));
        elements.push(pWithLinks);
        return elements;
    };
    RichTextData.addListElements = function (strictNested, nonStrictNested, trailingListItem) {
        var elements = [];
        // Ordered list
        var orderedList = new content_1.ListElement(content_1.ListTypes.Ordered);
        var listItem = new content_1.ListItemElement();
        listItem.childNodes.push(new content_1.TextNode('Ordered list item 1'));
        orderedList.items.push(listItem);
        listItem = new content_1.ListItemElement();
        listItem.childNodes.push(new content_1.TextNode('Ordered list item 2'));
        orderedList.items.push(listItem);
        elements.push(orderedList);
        // Unordered list
        var unorderedList = new content_1.ListElement(content_1.ListTypes.Unordered);
        listItem = new content_1.ListItemElement();
        listItem.childNodes.push(new content_1.TextNode('Unordered list item 1'));
        unorderedList.items.push(listItem);
        var unorderedListItem2 = new content_1.ListItemElement();
        unorderedListItem2.childNodes.push(new content_1.TextNode('Unordered list item 2'));
        unorderedList.items.push(unorderedListItem2);
        if (strictNested) {
            var strictNestedList = new content_1.ListElement(content_1.ListTypes.Unordered);
            unorderedListItem2.nestedList = strictNestedList;
            listItem = new content_1.ListItemElement();
            listItem.childNodes.push(new content_1.TextNode('Nested list item'));
            strictNestedList.items.push(listItem);
        }
        if (nonStrictNested) {
            var nonStrictNestedList = new content_1.ListElement(content_1.ListTypes.Unordered);
            unorderedList.items.push(nonStrictNestedList);
            listItem = new content_1.ListItemElement();
            listItem.childNodes.push(new content_1.TextNode('Nested list in non-strict mode'));
            nonStrictNestedList.items.push(listItem);
            if (trailingListItem) {
                listItem = new content_1.ListItemElement();
                listItem.childNodes.push(new content_1.TextNode('Trailing list item'));
                unorderedList.items.push(listItem);
            }
        }
        elements.push(unorderedList);
        return elements;
    };
    RichTextData.getListsHtml = function (strictNested, nonStrictNested, trailingListItem) {
        return "<ol>\n  <li>Ordered list item 1</li>\n  <li>\nOrdered list item 2\n</li>\n</ol>\n\n<ul>\n  <li>Unordered list item 1</li>\n  <li>Unordered list item 2" + (strictNested ? "\n    <ul>\n      <li>Nested list item</li>\n    </ul>\n  " : '') + "</li>" + (nonStrictNested ? "\n  <ul>\n    <li>Nested list in non-strict mode</li>\n  </ul>" : '') + (trailingListItem ? '<li>Trailing list item</li>' : '') + "\n</ul>";
    };
    RichTextData.createTableElement = function (callback) {
        var table = new content_1.TableElement();
        var row = new content_1.TableRowElement();
        var cell = new content_1.TableCellElement();
        var cellContent = new content_1.ParagraphElement();
        cellContent.childNodes.push(new content_1.TextNode('Name'));
        cell.childElements.push(cellContent);
        row.cells.push(cell);
        cell = new content_1.TableCellElement();
        cellContent = new content_1.ParagraphElement();
        cellContent.childNodes.push(new content_1.TextNode('Surname'));
        cell.childElements.push(cellContent);
        row.cells.push(cell);
        table.rows.push(row);
        row = new content_1.TableRowElement();
        cell = new content_1.TableCellElement();
        cellContent = new content_1.ParagraphElement();
        cellContent.childNodes.push(new content_1.TextNode('A'));
        cell.childElements.push(cellContent);
        row.cells.push(cell);
        cell = new content_1.TableCellElement();
        cellContent = new content_1.ParagraphElement();
        cellContent.childNodes.push(new content_1.TextNode('B'));
        cell.childElements.push(cellContent);
        row.cells.push(cell);
        table.rows.push(row);
        row = new content_1.TableRowElement();
        cell = new content_1.TableCellElement();
        cellContent = new content_1.ParagraphElement();
        cellContent.childNodes.push(new content_1.TextNode('C'));
        cell.childElements.push(cellContent);
        row.cells.push(cell);
        cell = new content_1.TableCellElement();
        cell.childElements = callback();
        row.cells.push(cell);
        table.rows.push(row);
        return table;
    };
    return RichTextData;
}());
exports.RichTextData = RichTextData;
//# sourceMappingURL=rich-text-data.js.map