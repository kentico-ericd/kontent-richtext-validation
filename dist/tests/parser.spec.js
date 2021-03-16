"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var html_parser_1 = require("../lib/html-parser");
var content_1 = require("../lib/content");
var rich_text_data_1 = require("./rich-text-data");
var jest_theories_1 = require("jest-theories");
describe('Parser', function () {
    function parse(input, strict) {
        if (strict === void 0) { strict = true; }
        var tokens = [];
        if (typeof input === 'string') {
            var scanner = new html_parser_1.Scanner();
            tokens = scanner.scan(input);
        }
        else
            tokens = input;
        var parser = new html_parser_1.Parser(strict);
        var doc = parser.parse(tokens);
        return doc;
    }
    test('Empty input returns no tokens', function () {
        var document = parse([]);
        expect(document).not.toBeNull();
        expect(document.elements.length).toBe(0);
    });
    test('Single paragraph passes', function () {
        var tokens = [
            new html_parser_1.Token(html_parser_1.TokenType.OpeningTagBeginning, 0, 0, 'p'),
            new html_parser_1.Token(html_parser_1.TokenType.OpeningTagEnd, 0, 0),
            new html_parser_1.Token(html_parser_1.TokenType.PlainText, 0, 0, 'Hello world'),
            new html_parser_1.Token(html_parser_1.TokenType.ClosingTag, 0, 0, 'p')
        ];
        var document = parse(tokens);
        expect(document).not.toBeNull();
    });
    test('Plain text is decoded', function () {
        var tokens = [
            new html_parser_1.Token(html_parser_1.TokenType.OpeningTagBeginning, 0, 0, 'p'),
            new html_parser_1.Token(html_parser_1.TokenType.OpeningTagEnd, 0, 0),
            new html_parser_1.Token(html_parser_1.TokenType.PlainText, 0, 0, 'Hello &amp; &lt;world&gt;'),
            new html_parser_1.Token(html_parser_1.TokenType.ClosingTag, 0, 0, 'p')
        ];
        var document = parse(tokens);
        var paragraph = document.elements[0];
        var textNode = paragraph.childNodes[0];
        expect('Hello & <world>').toEqual(textNode.textContent);
    });
    var theories = [
        { input: '<p>a\nbb\nccc</p>', expected: 'a bb ccc' },
        { input: '<p>a \nbb</p>', expected: 'a bb' },
        { input: '<p>a\n bb</p>', expected: 'a bb' },
        { input: '<p>a \n bb  </p>', expected: 'a bb' },
        { input: '<p>a    bb</p>', expected: 'a bb' },
        { input: '<p>\n\n\n\na\nbb\nccc</p>', expected: 'a bb ccc' },
        { input: '<p>a\r\n\r\nb</p>', expected: 'a b' },
    ];
    jest_theories_1.default('Whitespaces in strings are normalized', theories, function (theory) {
        var document = parse(theory.input);
        var paragraph = document.elements[0];
        var textNode = paragraph.childNodes[0];
        expect(textNode.textContent).toEqual(theory.expected);
    });
    test('Two paragraphs pass', function () {
        var tokens = [
            new html_parser_1.Token(html_parser_1.TokenType.OpeningTagBeginning, 0, 0, 'p'),
            new html_parser_1.Token(html_parser_1.TokenType.OpeningTagEnd, 0, 0),
            new html_parser_1.Token(html_parser_1.TokenType.PlainText, 0, 0, 'Hello world'),
            new html_parser_1.Token(html_parser_1.TokenType.ClosingTag, 0, 0, 'p'),
            new html_parser_1.Token(html_parser_1.TokenType.OpeningTagBeginning, 0, 0, 'p'),
            new html_parser_1.Token(html_parser_1.TokenType.OpeningTagEnd, 0, 0),
            new html_parser_1.Token(html_parser_1.TokenType.PlainText, 0, 0, 'Hello world'),
            new html_parser_1.Token(html_parser_1.TokenType.ClosingTag, 0, 0, 'p')
        ];
        var document = parse(tokens);
        expect(document).not.toBeNull();
    });
    theories = [
        { input: '' },
        { input: '<p>paragraph</p>' },
        { input: '<p>para<br/>graph</p>' },
        { input: '<p><strong>bold</strong></p>' },
        { input: '<p><em>italic</em></p>' },
        { input: '<p><em>ita<strong>bold</strong>lic</em></p>' },
        { input: '<p><em>ita<strong>bold</strong><br/>lic</em></p>' },
        { input: '<p>I am<sup>superscript</sup></p>' },
        { input: '<p>I am<sub>subscript</sub></p>' },
        { input: '<p><code>I am code text</code></p>' },
        { input: '<p>Text with <strong>bold</strong> and <em>italic</em> and <em>some </em><em><strong>mixed</strong></em><em> ones</em> and<br/>a new line.</p>' },
        { input: '<h1>Heading</h1>' },
        { input: '<ul><li>item</li></ul>' },
        { input: '<ul><li>item</li><li><ol><li>SubItem</li></ol></li></ul>' },
        { input: '<ul><li>item1</li><li>item2</li></ul>' },
        { input: '<ul><li>it<em>em1</em></li><li>item2</li></ul>' },
        { input: '<ol><li>item1</li><li>item2</li></ol>' },
        { input: '<h1>Heading</h1><ul><li>item1</li><li><strong>BOLD</strong>item2</li></ul>' },
        { input: '<table><tbody><tr><td>A1</td><td>A2</td></tr><tr><td>B1</td><td>B2</td></tr></tbody></table>' },
        { input: '<object type="application/kenticocloud" data-type="item" data-id="a815faa5-009e-489b-b8bb-a7f3dda0e047"></object>' },
        { input: '<object type="application/kenticocloud" data-type="item" data-external-id="my-external_id is good"></object>' },
        { input: '<object data-id="a815faa5-009e-489b-b8bb-a7f3dda0e047" type="application/kenticocloud" data-type="item"></object>' },
        { input: '<p>Taste Natural Barra Grande from the high altitudes of Poco Fundo in&nbsp;Minas Gerais in Brazil, where a family business with a strong keenness&nbsp;on natural processing has been growing coffee for three<a href="http://google.sk"> http://google.sk</a> generations.</p>' },
        { input: '<figure data-asset-id="250b7b78-5e23-4667-a7df-8c2705dce7a6"><img src="#" data-asset-id="250b7b78-5e23-4667-a7df-8c2705dce7a6"></figure>' },
        { input: '<figure data-asset-external-id="external image"><img src="#"></figure>' },
        { input: '<p><a data-item-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e">text</a></p>' },
        { input: '<p><a data-asset-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e">text</a></p>' },
        { input: '<p><a data-item-external-id="external">text</a></p>' },
        { input: '<p><a data-asset-external-id="external">text</a></p>' },
    ];
    jest_theories_1.default('Valid strings pass', theories, function (theory) {
        var document = parse(theory.input);
        expect(document).not.toBeNull();
    });
    theories = [
        { input: '<p><a href="" data-item-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e">text</a></p>' },
        { input: '<p><a href="" data-asset-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e">text</a></p>' },
        { input: '<p><a href="" data-item-external-id="external">text</a></p>' },
        { input: '<p><a href="" data-asset-external-id="external">text</a></p>' },
        { input: '<p><a href="" data-email-address="email@address.com">text</a></p>' },
        { input: '<p><a data-item-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e" data-asset-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e">text</a></p>' },
        { input: '<p><a data-item-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e" data-item-external-id="external">text</a></p>' },
        { input: '<p><a data-item-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e" data-asset-external-id="external">text</a></p>' },
        { input: '<p><a data-item-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e" data-email-address="email@address.com">text</a></p>' },
        { input: '<p><a data-asset-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e" data-item-external-id="external">text</a></p>' },
        { input: '<p><a data-asset-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e" data-asset-external-id="external">text</a></p>' },
        { input: '<p><a data-asset-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e" data-email-address="email@address.com">text</a></p>' },
        { input: '<p><a data-item-external-id="external" data-asset-external-id="external">text</a></p>' },
        { input: '<p><a data-item-external-id="external" data-email-address="email@address.com">text</a></p>' },
        { input: '<p><a data-asset-external-id="external" data-email-address="email@address.com">text</a></p>' },
    ];
    jest_theories_1.default('Mixed link types throws', theories, function (theory) {
        expect(function () { parse(theory.input); }).toThrow();
    });
    theories = [
        { strictNestedList: true, nonStrictNestedList: true, listItemTrailsNestedList: false },
        { strictNestedList: true, nonStrictNestedList: true, listItemTrailsNestedList: true },
        { strictNestedList: true, nonStrictNestedList: false, listItemTrailsNestedList: false },
        { strictNestedList: false, nonStrictNestedList: true, listItemTrailsNestedList: false },
        { strictNestedList: false, nonStrictNestedList: true, listItemTrailsNestedList: true },
        { strictNestedList: false, nonStrictNestedList: false, listItemTrailsNestedList: false },
    ];
    jest_theories_1.default('Complex input passes', theories, function (theory) {
        var _a, _b;
        var text = "\n\n" + rich_text_data_1.RichTextData.textHtml + "\n" + rich_text_data_1.RichTextData.imageHtml + "\n" + rich_text_data_1.RichTextData.getListsHtml(theory.strictNestedList, theory.nonStrictNestedList, theory.listItemTrailsNestedList) + "\n<table><tbody>\n<tr><td>Name</td><td>Surname</td></tr>\n<tr><td>\nA\n</td><td>B</td></tr>\n<tr><td>C</td><td>\n\n" + rich_text_data_1.RichTextData.imageHtml + "\n" + rich_text_data_1.RichTextData.textHtml + "\n" + rich_text_data_1.RichTextData.getListsHtml(theory.strictNestedList, theory.nonStrictNestedList, theory.listItemTrailsNestedList) + "\n</td></tr>\n</tbody></table>\n" + rich_text_data_1.RichTextData.modularContentHtml + "\n" + rich_text_data_1.RichTextData.contentComponentHtml + "\n\n        ";
        var contentComponents = [rich_text_data_1.RichTextData.contentComponentElement];
        var tokens = new html_parser_1.Scanner().scan(text);
        var model = new html_parser_1.Parser(false).parse(tokens, contentComponents);
        var expected = new content_1.RichTextContentModel();
        (_a = expected.elements).push.apply(_a, rich_text_data_1.RichTextData.addTextElements()); // 0
        expected.elements.push(rich_text_data_1.RichTextData.imageElement); // 9
        (_b = expected.elements).push.apply(_b, rich_text_data_1.RichTextData.addListElements(theory.strictNestedList, theory.nonStrictNestedList, theory.listItemTrailsNestedList)); // 10
        expected.elements.push(rich_text_data_1.RichTextData.createTableElement(// 12
        function () { return __spreadArrays([
            rich_text_data_1.RichTextData.imageElement
        ], rich_text_data_1.RichTextData.addTextElements(), rich_text_data_1.RichTextData.addListElements(theory.strictNestedList, theory.nonStrictNestedList, theory.listItemTrailsNestedList)); }));
        expected.elements.push(rich_text_data_1.RichTextData.modularContentElement); // 13
        expected.elements.push(rich_text_data_1.RichTextData.contentComponentElement); // 14
        expect(expected.elements).toEqual(model.elements);
    });
    test('Nested list with trailing list items passes', function () {
        var richTextValue = "\n<ul>\n    <ul>  \n        <li>Double nested list item</li> \n    </ul>\n    <li>Trailing list item</li>\n</ul>";
        var actualModel = parse(richTextValue, false);
        var expectedModel = new content_1.RichTextContentModel();
        var unorderedList = new content_1.ListElement(content_1.ListTypes.Unordered);
        expectedModel.elements.push(unorderedList);
        var nestedUnorderedList = new content_1.ListElement(content_1.ListTypes.Unordered);
        unorderedList.items.push(nestedUnorderedList);
        nestedUnorderedList.items.push(new content_1.ListItemElement([new content_1.TextNode('Double nested list item')]));
        unorderedList.items.push(new content_1.ListItemElement([new content_1.TextNode('Trailing list item')]));
        expect(expectedModel.elements).toEqual(actualModel.elements);
    });
    theories = [
        { strictNested: true },
        { strictNested: false },
    ];
    jest_theories_1.default('Strict mode throws for non-strict nested list', theories, function (theory) {
        expect(function () { parse(rich_text_data_1.RichTextData.getListsHtml(theory.strictNested, true, theory.strictNested), true); }).toThrow();
    });
    theories = [
        { input: rich_text_data_1.RichTextData.modularContentHtml },
        { input: rich_text_data_1.RichTextData.contentComponentHtml },
        { input: rich_text_data_1.RichTextData.simpleTableHtml }
    ];
    jest_theories_1.default('Invalid table content throws', theories, function (theory) {
        var text = "<table><tbody>\n  <tr><td>Name</td><td>Surname</td></tr>\n  <tr><td>\nA\n</td><td>B</td></tr>\n  <tr><td>C</td><td>\n      \n" + rich_text_data_1.RichTextData.imageHtml + "\n" + rich_text_data_1.RichTextData.textHtml + "\n" + theory.input + "\n" + rich_text_data_1.RichTextData.getListsHtml(false, false, false) + "\n</td></tr>\n</tbody></table>";
        expect(function () { parse(text); }).toThrow();
    });
    theories = [
        { input: '<p><strong>bold</strong></p>', expectedReferenceCount: 0 },
        { input: '<p><a data-item-id="7819dd59-1aa3-4c03-9d32-172c40167f77">content item link</a></p>', expectedReferenceCount: 1 },
        { input: '<p><a data-item-id="7819dd59-1aa3-4c03-9d32-172c40167f77">content item link</a> and an <a data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444">asset link</a>.</p><figure data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"><img src="#"></figure><object type="application/kenticocloud" data-type="item" data-id="7819dd59-1aa3-4c03-9d32-172c40167f77"></object>', expectedReferenceCount: 4 },
        { input: '<p><a data-item-id="7819dd59-1aa3-4c03-9d32-172c40167f77">content item link</a></p><table><tbody><tr><td><p><a data-item-id="7819dd59-1aa3-4c03-9d32-172c40167f77">content item link</a> and an <a data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444">asset link</a>.</p><figure data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"><img src="#"></figure></td></tr></tbody></table>', expectedReferenceCount: 4 },
    ];
    jest_theories_1.default('Input with references returns correct number of references', theories, function (theory) {
        var model = parse(theory.input);
        expect(model.references.length).toEqual(theory.expectedReferenceCount);
    });
    test('Input with different link types passes', function () {
        var text = '<p>Text with a <a href="http://www.kentico.com">URL link</a>, a <a href="http://www.kenticocloud.com" data-new-window="true">URL link that opens in a new window</a>, a <a data-item-id="7819dd59-1aa3-4c03-9d32-172c40167f77">content item link</a>, an <a data-email-address="info@kentico.com" data-email-subject="Hi there!">e-mail link</a> and an <a data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444">asset link</a>.</p>';
        var document = parse(text);
        var paragraph = document.elements[0];
        var webLinks = paragraph.childNodes.filter(function (n) { return n instanceof content_1.WebLinkNode; });
        var assetLinks = paragraph.childNodes.filter(function (n) { return n instanceof content_1.AssetLinkNode; });
        var contentLinks = paragraph.childNodes.filter(function (n) { return n instanceof content_1.ContentItemLinkNode; });
        var emailLinks = paragraph.childNodes.filter(function (n) { return n instanceof content_1.EmailLinkNode; });
        expect(webLinks[0].url).toEqual('http://www.kentico.com');
        expect(webLinks[0].target).toEqual(content_1.WebLinkTargets.Self);
        expect(webLinks[1].url).toEqual('http://www.kenticocloud.com');
        expect(webLinks[1].target).toEqual(content_1.WebLinkTargets.Blank);
        expect(assetLinks[0].id).toEqual('30a3a8c2-e9ab-47c2-84f4-e470985a3444');
        expect(contentLinks[0].id).toEqual('7819dd59-1aa3-4c03-9d32-172c40167f77');
        expect(emailLinks[0].to).toEqual('info@kentico.com');
        expect(emailLinks[0].subject).toEqual('Hi there!');
    });
    test('Self-closing HTML5 tags pass', function () {
        var text = '<p>L1<br>L2<BR>L3<br/>br</p>';
        var document = parse(text);
        expect(document).not.toBeNull();
    });
    theories = [
        { input: '<p><a href="" data-item-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e">text</a></p>' },
        { input: '<p><a href="" data-asset-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e">text</a></p>' },
        { input: '<p><a href="" data-item-external-id="external">text</a></p>' },
        { input: '<p><a href="" data-asset-external-id="external">text</a></p>' },
        { input: '<p><a href="" data-email-address="email@address.com">text</a></p>' },
        { input: '<p><a data-item-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e" data-asset-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e">text</a></p>' },
        { input: '<p><a data-item-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e" data-item-external-id="external">text</a></p>' },
        { input: '<p><a data-item-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e" data-asset-external-id="external">text</a></p>' },
        { input: '<p><a data-item-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e" data-email-address="email@address.com">text</a></p>' },
        { input: '<p><a data-asset-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e" data-item-external-id="external">text</a></p>' },
        { input: '<p><a data-asset-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e" data-asset-external-id="external">text</a></p>' },
        { input: '<p><a data-asset-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e" data-email-address="email@address.com">text</a></p>' },
        { input: '<p><a data-item-external-id="external" data-asset-external-id="external">text</a></p>' },
        { input: '<p><a data-item-external-id="external" data-email-address="email@address.com">text</a></p>' },
        { input: '<p><a data-asset-external-id="external" data-email-address="email@address.com">text</a></p>' },
    ];
    jest_theories_1.default('Mixed link attributes throws', theories, function (theory) {
        expect(function () { parse(theory.input); }).toThrow();
    });
    test('Self-closing HTML5 tags throw', function () {
        var parser = new html_parser_1.Parser(true);
        var tokens = [
            new html_parser_1.Token(html_parser_1.TokenType.OpeningTagBeginning, 1, 1, 'p'),
            new html_parser_1.Token(html_parser_1.TokenType.OpeningTagEnd, 1, 2),
            new html_parser_1.Token(html_parser_1.TokenType.OpeningTagBeginning, 1, 3, 'br'),
            new html_parser_1.Token(html_parser_1.TokenType.OpeningTagBeginning, 1, 8, 'br'),
            new html_parser_1.Token(html_parser_1.TokenType.ClosingTag, 1, 12, 'p')
        ];
        expect(function () { parser.parse(tokens); }).toThrow();
    });
    test('Duplicate attributes throw', function () {
        var text = "<p>Text with a <a data-item-id=\"7819dd59-1aa3-4c03-9d32-172c40167f77\" data-item-id=\"7819dd59-1aa3-4c03-9d32-172c40167f78\">content item link</a>.";
        expect(function () { parse(text); }).toThrow();
    });
    test('Invalid figure element throws', function () {
        var text = "<figure     data-ass-id=\"250b7b78-5e23-4667-a7df-8c2705dce7a6\"><img src=\"#\" data-asset-id=\"30a3a8c2-e9ab-47c2-84f4-e470985a3444\"></figure>";
        expect(function () { parse(text); }).toThrow();
    });
    test('Invalid mutually exclusive tags throw', function () {
        var text = "<p>2<sup>super<sub>sub</sub>script</sup></p>";
        expect(function () { parse(text); }).toThrow();
    });
    test('Rich text with components passes', function () {
        var scanner = new html_parser_1.Scanner();
        var parser = new html_parser_1.Parser(true);
        var firstComponentId = '6434e475-5a29-4866-9fd1-6d1ca873f5be';
        var secondComponentId = 'ca333cdd-b633-486d-8b8b-faa7c28c0c4c';
        var text = "<p>\u00DArove\u0148 1</p>\n<object type=\"application/kenticocloud\" data-type=\"component\" data-id=\"" + firstComponentId + "\"></object>\n<object type=\"application/kenticocloud\" data-type=\"component\" data-id=\"" + secondComponentId + "\"></object>";
        var contentComponents = [
            new content_1.ContentComponentElement(firstComponentId, '08ab71bb-e7ef-408f-9f3b-25c525814e3b', [
                new content_1.RichTextContentModel([new content_1.ParagraphElement()])
            ]),
            new content_1.ContentComponentElement(secondComponentId, '00000000-0000-0000-0000-000000000000', [])
        ];
        var tokens = scanner.scan(text);
        var doc = parser.parse(tokens, contentComponents);
        expect(doc.elements.filter(function (e) { return e instanceof content_1.ContentComponentElement && e.id == firstComponentId; }).length).toEqual(1);
        expect(doc.elements.filter(function (e) { return e instanceof content_1.ContentComponentElement && e.id == secondComponentId; }).length).toEqual(1);
    });
    test('Rich text with components without defined component throws', function () {
        var scanner = new html_parser_1.Scanner();
        var parser = new html_parser_1.Parser(true);
        var text = "<p>\u00DArove\u0148 1</p>\n<object type=\"application/kenticocloud\" data-type=\"component\" data-id=\"6434e475-5a29-4866-9fd1-6d1ca873f5be\"></object>\n<object type=\"application/kenticocloud\" data-type=\"component\" data-id=\"ca333cdd-b633-486d-8b8b-faa7c28c0c4c\"></object>";
        var contentComponents = [
            new content_1.ContentComponentElement('ca333cdd-b633-486d-8b8b-faa7c28c0c4c', '00000000-0000-0000-0000-000000000000', [])
        ];
        var tokens = scanner.scan(text);
        expect(function () { parser.parse(tokens, contentComponents); }).toThrow();
    });
    test('Defined components not used in rich text throws', function () {
        var scanner = new html_parser_1.Scanner();
        var parser = new html_parser_1.Parser(true);
        var usedComponent = '6434e475-5a29-4866-9fd1-6d1ca873f5be';
        var unusedComponent = 'ca333cdd-b633-486d-8b8b-faa7c28c0c4c';
        var text = "<p>\u00DArove\u0148 1</p>\n<object type=\"application/kenticocloud\" data-type=\"component\" data-id=\"" + usedComponent + "\"></object>";
        var contentComponents = [
            new content_1.ContentComponentElement(usedComponent, '08ab71bb-e7ef-408f-9f3b-25c525814e3b', [
                new content_1.RichTextContentModel([new content_1.ParagraphElement])
            ]),
            new content_1.ContentComponentElement(unusedComponent, '00000000-0000-0000-0000-000000000000', [])
        ];
        var tokens = scanner.scan(text);
        expect(function () { parser.parse(tokens, contentComponents); }).toThrow();
    });
    test('Empty rich text with defined component throws', function () {
        var parser = new html_parser_1.Parser(true);
        var contentComponents = [
            new content_1.ContentComponentElement('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', [])
        ];
        expect(function () { parser.parse([], contentComponents); }).toThrow();
    });
    test('Component without data-id attribute throws', function () {
        var text = '<object type="application/kenticocloud" data-type="component"></object>';
        expect(function () { parse(text); }).toThrow();
    });
    theories = [
        { input: '<object type="application/kenticocloud" data-type="component" data-codename="a93d3570-6eb4-4f62-8ad3-2afead6ae62a"></object>' },
        { input: '<object type="application/kenticocloud" data-type="component" data-ide="a93d3570-6eb4-4f62-8ad3-2afead6ae62a"></object>' },
        { input: '<object type="application/kenticocloud" data-type="component" data-id="f2f417df"></object>' }
    ];
    jest_theories_1.default('Components with 3 attributes but no data-id throw', theories, function (theory) {
        expect(function () { parse(theory.input); }).toThrow();
    });
});
//# sourceMappingURL=parser.spec.js.map