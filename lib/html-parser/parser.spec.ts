import { Parser, Token, TokenType, Scanner } from '../html-parser';
import { ParagraphElement, RichTextContentModel, TextNode } from '../content';
import theoretically from 'jest-theories';

const parse = (input: Token[] | string): RichTextContentModel => {
    let tokens: Token[] = [];
    if (typeof input === 'string') {
        const scanner = new Scanner();
        tokens = scanner.scan(input);
    }
    else tokens = input;

    var parser = new Parser(true);
    var doc = parser.parse(tokens);

    return doc;
}

describe('Parser', () => {
    test('Empty input returns no tokens', () => {
        const document = parse([]);

        expect(document).not.toBeNull();
        expect(document.elements.length).toBe(0);
    });

    test('Single paragraph passes', () => {
        const tokens: Token[] = [
            new Token(TokenType.OpeningTagBeginning, 0, 0, 'p'),
            new Token(TokenType.OpeningTagEnd, 0, 0),
            new Token(TokenType.PlainText, 0, 0, 'Hello world'),
            new Token(TokenType.ClosingTag, 0, 0, 'p')
        ];
        const document = parse(tokens);

        expect(document).not.toBeNull();
    });

    test('Plain text is decoded', () => {
        const tokens: Token[] = [
            new Token(TokenType.OpeningTagBeginning, 0, 0, 'p'),
            new Token(TokenType.OpeningTagEnd, 0, 0),
            new Token(TokenType.PlainText, 0, 0, 'Hello &amp; &lt;world&gt;'),
            new Token(TokenType.ClosingTag, 0, 0, 'p')
        ];
        const document = parse(tokens);
        const paragraph: ParagraphElement = <ParagraphElement>document.elements[0];
        const textNode: TextNode = <TextNode>paragraph.childNodes[0];

        expect('Hello & <world>').toEqual(textNode.textContent);
    });

    const theories = [
        { input: '<p>a\nbb\nccc</p>', expected: 'a bb ccc' },
        { input: '<p>a \nbb</p>', expected: 'a bb' },
        { input: '<p>a\n bb</p>', expected: 'a bb' },
        { input: '<p>a \n bb  </p>', expected: 'a bb' },
        { input: '<p>a    bb</p>', expected: 'a bb' },
        { input: '<p>\n\n\n\na\nbb\nccc</p>', expected: 'a bb ccc' },
        { input: '<p>a\r\n\r\nb</p>', expected: 'a b' },
    ];
    theoretically('Whitespace in string {input} are normalized', theories, theory => {
        const document = parse(theory.input);
        const paragraph: ParagraphElement = <ParagraphElement>document.elements[0];
        const textNode: TextNode = <TextNode>paragraph.childNodes[0];

        expect(textNode.textContent).toEqual(theory.expected);
    });


});
