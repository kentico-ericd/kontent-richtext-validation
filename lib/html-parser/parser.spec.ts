import { Parser, Token, TokenType } from '../html-parser';
import { ParagraphElement, RichTextContentModel, TextNode } from '../content';

const parse = (tokens: Token[]): RichTextContentModel => {
    var parser = new Parser(true);
    var doc = parser.parse(tokens);

    return doc;
}

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
        new Token(TokenType.ClosingTag, 0, 0, 'p' )
    ];

    var document = parse(tokens);
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