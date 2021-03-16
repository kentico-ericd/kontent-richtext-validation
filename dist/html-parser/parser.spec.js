"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var html_parser_1 = require("../html-parser");
var jest_theories_1 = require("jest-theories");
var parse = function (input) {
    var tokens = [];
    if (typeof input === 'string') {
        var scanner = new html_parser_1.Scanner();
        tokens = scanner.scan(input);
    }
    else
        tokens = input;
    var parser = new html_parser_1.Parser(true);
    var doc = parser.parse(tokens);
    return doc;
};
describe('Parser', function () {
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
    jest_theories_1.default('Whitespace in string {input} are normalized', theories, function (theory) {
        var document = parse(theory.input);
        var paragraph = document.elements[0];
        var textNode = paragraph.childNodes[0];
        expect(textNode.textContent).toEqual(theory.expected);
    });
});
