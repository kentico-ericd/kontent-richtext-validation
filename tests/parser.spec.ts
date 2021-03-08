import { Parser, Token, TokenType, Scanner } from '../lib/html-parser';
import {
    ParagraphElement,
    RichTextContentModel,
    TextNode,
    ContentComponentElement,
    ListElement,
    ListTypes,
    ListItemElement,
    WebLinkNode,
    AssetLinkNode,
    ContentItemLinkNode,
    EmailLinkNode,
    WebLinkTargets
} from '../lib/content';
import { RichTextData } from './rich-text-data';
import theoretically from 'jest-theories';

describe('Parser', () => {
    function parse(input: Token[] | string, strict: boolean = true): RichTextContentModel {
        let tokens: Token[] = [];
        if (typeof input === 'string') {
            const scanner = new Scanner();
            tokens = scanner.scan(input);
        }
        else tokens = input;

        var parser = new Parser(strict);
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

    let theories: any[] = [
        { input: '<p>a\nbb\nccc</p>', expected: 'a bb ccc' },
        { input: '<p>a \nbb</p>', expected: 'a bb' },
        { input: '<p>a\n bb</p>', expected: 'a bb' },
        { input: '<p>a \n bb  </p>', expected: 'a bb' },
        { input: '<p>a    bb</p>', expected: 'a bb' },
        { input: '<p>\n\n\n\na\nbb\nccc</p>', expected: 'a bb ccc' },
        { input: '<p>a\r\n\r\nb</p>', expected: 'a b' },
    ];
    theoretically('Whitespaces in strings are normalized', theories, theory => {
        const document = parse(theory.input);
        const paragraph: ParagraphElement = <ParagraphElement>document.elements[0];
        const textNode: TextNode = <TextNode>paragraph.childNodes[0];

        expect(textNode.textContent).toEqual(theory.expected);
    });

    test('Two paragraphs pass', () => {
        const tokens: Token[] = [
            new Token(TokenType.OpeningTagBeginning, 0, 0, 'p'),
            new Token(TokenType.OpeningTagEnd, 0, 0),
            new Token(TokenType.PlainText, 0, 0, 'Hello world'),
            new Token(TokenType.ClosingTag, 0, 0, 'p'),
            new Token(TokenType.OpeningTagBeginning, 0, 0, 'p'),
            new Token(TokenType.OpeningTagEnd, 0, 0),
            new Token(TokenType.PlainText, 0, 0, 'Hello world'),
            new Token(TokenType.ClosingTag, 0, 0, 'p')
        ];
        const document = parse(tokens);

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
    theoretically('Valid strings pass', theories, theory => {
        const document = parse(theory.input);
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
    theoretically('Mixed link types throws', theories, theory => {
        expect(() => { parse(theory.input); }).toThrow();
    });

    theories = [
        { strictNestedList: true, nonStrictNestedList: true, listItemTrailsNestedList: false },
        { strictNestedList: true, nonStrictNestedList: true, listItemTrailsNestedList: true },
        { strictNestedList: true, nonStrictNestedList: false, listItemTrailsNestedList: false },
        { strictNestedList: false, nonStrictNestedList: true, listItemTrailsNestedList: false },
        { strictNestedList: false, nonStrictNestedList: true, listItemTrailsNestedList: true },
        { strictNestedList: false, nonStrictNestedList: false, listItemTrailsNestedList: false },
    ];
    theoretically('Complex input passes', theories, theory => {
        const text = `

${RichTextData.textHtml}
${RichTextData.imageHtml}
${RichTextData.getListsHtml(theory.strictNestedList, theory.nonStrictNestedList, theory.listItemTrailsNestedList)}
<table><tbody>
<tr><td>Name</td><td>Surname</td></tr>
<tr><td>
A
</td><td>B</td></tr>
<tr><td>C</td><td>

${RichTextData.imageHtml}
${RichTextData.textHtml}
${RichTextData.getListsHtml(theory.strictNestedList, theory.nonStrictNestedList, theory.listItemTrailsNestedList)}
</td></tr>
</tbody></table>
${RichTextData.modularContentHtml}
${RichTextData.contentComponentHtml}

        `;
        const contentComponents: ContentComponentElement[] = [RichTextData.contentComponentElement];
        const tokens = new Scanner().scan(text);
        const model = new Parser(false).parse(tokens, contentComponents);
        const expected = new RichTextContentModel();

        expected.elements.push(...RichTextData.addTextElements()); // 0
        expected.elements.push(RichTextData.imageElement); // 9
        expected.elements.push(...RichTextData.addListElements(theory.strictNestedList, theory.nonStrictNestedList, theory.listItemTrailsNestedList)); // 10
        expected.elements.push(
            RichTextData.createTableElement( // 12
                () => [
                    RichTextData.imageElement,
                    ...RichTextData.addTextElements(),
                    ...RichTextData.addListElements(theory.strictNestedList, theory.nonStrictNestedList, theory.listItemTrailsNestedList)
                ]
            )
        );
        expected.elements.push(RichTextData.modularContentElement); // 13
        expected.elements.push(RichTextData.contentComponentElement); // 14

        expect(expected.elements).toEqual(model.elements);
    });

    test('Nested list with trailing list items passes', () => {
        const richTextValue = `
<ul>
    <ul>  
        <li>Double nested list item</li> 
    </ul>
    <li>Trailing list item</li>
</ul>`;

        const actualModel = parse(richTextValue, false);
        const expectedModel = new RichTextContentModel();

        const unorderedList = new ListElement(ListTypes.Unordered);
        expectedModel.elements.push(unorderedList);
        const nestedUnorderedList = new ListElement(ListTypes.Unordered);
        unorderedList.items.push(nestedUnorderedList);

        nestedUnorderedList.items.push(new ListItemElement(
            [new TextNode('Double nested list item')]
        ));

        unorderedList.items.push(new ListItemElement(
            [new TextNode('Trailing list item')]
        ));

        expect(expectedModel.elements).toEqual(actualModel.elements);
    });

    theories = [
        { strictNested: true },
        { strictNested: false },
    ];
    theoretically('Strict mode throws for non-strict nested list', theories, theory => {
        expect(() => { parse(RichTextData.getListsHtml(theory.strictNested, true, theory.strictNested), true) }).toThrow();
    });

    theories = [
        { input: RichTextData.modularContentHtml },
        { input: RichTextData.contentComponentHtml },
        { input: RichTextData.simpleTableHtml }
    ];
    theoretically('Invalid table content throws', theories, theory => {
        const text = `<table><tbody>
  <tr><td>Name</td><td>Surname</td></tr>
  <tr><td>
A
</td><td>B</td></tr>
  <tr><td>C</td><td>
      
${RichTextData.imageHtml}
${RichTextData.textHtml}
${theory.input}
${RichTextData.getListsHtml(false, false, false)}
</td></tr>
</tbody></table>`;

        expect(() => { parse(text); }).toThrow();
    });

    theories = [
        { input: '<p><strong>bold</strong></p>', expectedReferenceCount: 0 },
        { input: '<p><a data-item-id="7819dd59-1aa3-4c03-9d32-172c40167f77">content item link</a></p>', expectedReferenceCount: 1 },
        { input: '<p><a data-item-id="7819dd59-1aa3-4c03-9d32-172c40167f77">content item link</a> and an <a data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444">asset link</a>.</p><figure data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"><img src="#"></figure><object type="application/kenticocloud" data-type="item" data-id="7819dd59-1aa3-4c03-9d32-172c40167f77"></object>', expectedReferenceCount: 4 },
        { input: '<p><a data-item-id="7819dd59-1aa3-4c03-9d32-172c40167f77">content item link</a></p><table><tbody><tr><td><p><a data-item-id="7819dd59-1aa3-4c03-9d32-172c40167f77">content item link</a> and an <a data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444">asset link</a>.</p><figure data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"><img src="#"></figure></td></tr></tbody></table>', expectedReferenceCount: 4 },
    ];
    theoretically('Input with references returns correct number of references', theories, theory => {
        var model = parse(theory.input);
        expect(model.references.length).toEqual(theory.expectedReferenceCount);
    });

    test('Input with different link types passes', () => {
        const text = '<p>Text with a <a href="http://www.kentico.com">URL link</a>, a <a href="http://www.kenticocloud.com" data-new-window="true">URL link that opens in a new window</a>, a <a data-item-id="7819dd59-1aa3-4c03-9d32-172c40167f77">content item link</a>, an <a data-email-address="info@kentico.com" data-email-subject="Hi there!">e-mail link</a> and an <a data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444">asset link</a>.</p>';
        const document = parse(text);

        const paragraph: ParagraphElement = <ParagraphElement>document.elements[0];
        const webLinks = paragraph.childNodes.filter(n => n instanceof WebLinkNode) as WebLinkNode[];
        const assetLinks = paragraph.childNodes.filter(n => n instanceof AssetLinkNode) as AssetLinkNode[];
        const contentLinks = paragraph.childNodes.filter(n => n instanceof ContentItemLinkNode) as ContentItemLinkNode[];
        const emailLinks = paragraph.childNodes.filter(n => n instanceof EmailLinkNode) as EmailLinkNode[];

        expect(webLinks[0].url).toEqual('http://www.kentico.com');
        expect(webLinks[0].target).toEqual(WebLinkTargets.Self);

        expect(webLinks[1].url).toEqual('http://www.kenticocloud.com');
        expect(webLinks[1].target).toEqual(WebLinkTargets.Blank);

        expect(assetLinks[0].id).toEqual('30a3a8c2-e9ab-47c2-84f4-e470985a3444');

        expect(contentLinks[0].id).toEqual('7819dd59-1aa3-4c03-9d32-172c40167f77');

        expect(emailLinks[0].to).toEqual('info@kentico.com');
        expect(emailLinks[0].subject).toEqual('Hi there!');
    });

    test('Self-closing HTML5 tags pass', () => {
        const text = '<p>L1<br>L2<BR>L3<br/>br</p>';
        const document = parse(text);

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
    theoretically('Mixed link attributes throws', theories, theory => {
        expect(() => { parse(theory.input); }).toThrow();
    });

    test('Self-closing HTML5 tags throw', () => {
        const parser = new Parser(true);
        const tokens = [
            new Token(TokenType.OpeningTagBeginning, 1, 1, 'p'),
            new Token(TokenType.OpeningTagEnd, 1, 2),
            new Token(TokenType.OpeningTagBeginning, 1, 3, 'br'),
            new Token(TokenType.OpeningTagBeginning, 1, 8, 'br'),
            new Token(TokenType.ClosingTag, 1, 12, 'p')
        ];

        expect(() => { parser.parse(tokens); }).toThrow();
    });

    test('Duplicate attributes throw', () => {
        const text = `<p>Text with a <a data-item-id="7819dd59-1aa3-4c03-9d32-172c40167f77" data-item-id="7819dd59-1aa3-4c03-9d32-172c40167f78">content item link</a>.`;

        expect(() => { parse(text); }).toThrow();
    });

    test('Invalid figure element throws', () => {
        const text = `<figure     data-ass-id="250b7b78-5e23-4667-a7df-8c2705dce7a6"><img src="#" data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"></figure>`;

        expect(() => { parse(text); }).toThrow();
    });

    test('Invalid mutually exclusive tags throw', () => {
        const text = `<p>2<sup>super<sub>sub</sub>script</sup></p>`;

        expect(() => { parse(text); }).toThrow();
    });

    test('Rich text with components passes', () => {
        const scanner = new Scanner();
        const parser = new Parser(true);
        const firstComponentId = '6434e475-5a29-4866-9fd1-6d1ca873f5be';
        const secondComponentId = 'ca333cdd-b633-486d-8b8b-faa7c28c0c4c';
        const text = `<p>Úroveň 1</p>\n<object type="application/kenticocloud" data-type="component" data-id="${firstComponentId}"></object>\n<object type="application/kenticocloud" data-type="component" data-id="${secondComponentId}"></object>`;
        const contentComponents = [

            new ContentComponentElement(firstComponentId, '08ab71bb-e7ef-408f-9f3b-25c525814e3b', [
                new RichTextContentModel([new ParagraphElement()])
            ]),
            new ContentComponentElement(secondComponentId, '00000000-0000-0000-0000-000000000000', [])
        ];

        const tokens = scanner.scan(text);
        const doc = parser.parse(tokens, contentComponents);

        expect(doc.elements.filter(e => e instanceof ContentComponentElement && e.id == firstComponentId).length).toEqual(1);
        expect(doc.elements.filter(e => e instanceof ContentComponentElement && e.id == secondComponentId).length).toEqual(1);
    });

    test('Rich text with components without defined component throws', () => {
        const scanner = new Scanner();
        const parser = new Parser(true);
        const text = `<p>Úroveň 1</p>\n<object type="application/kenticocloud" data-type="component" data-id="6434e475-5a29-4866-9fd1-6d1ca873f5be"></object>\n<object type="application/kenticocloud" data-type="component" data-id="ca333cdd-b633-486d-8b8b-faa7c28c0c4c"></object>`;
        const contentComponents = [
            new ContentComponentElement('ca333cdd-b633-486d-8b8b-faa7c28c0c4c', '00000000-0000-0000-0000-000000000000', [])
        ];

        const tokens = scanner.scan(text);
        expect(() => { parser.parse(tokens, contentComponents); }).toThrow();
    });

    test('Defined components not used in rich text throws', () => {
        const scanner = new Scanner();
        const parser = new Parser(true);
        const usedComponent = '6434e475-5a29-4866-9fd1-6d1ca873f5be';
        const unusedComponent = 'ca333cdd-b633-486d-8b8b-faa7c28c0c4c';
        const text = `<p>Úroveň 1</p>\n<object type="application/kenticocloud" data-type="component" data-id="${usedComponent}"></object>`;
        const contentComponents = [
            new ContentComponentElement(usedComponent, '08ab71bb-e7ef-408f-9f3b-25c525814e3b', [
                new RichTextContentModel([new ParagraphElement])
            ]),
            new ContentComponentElement(unusedComponent, '00000000-0000-0000-0000-000000000000', [])
        ];

        const tokens = scanner.scan(text);
        expect(() => { parser.parse(tokens, contentComponents); }).toThrow();
    });

    test('Empty rich text with defined component throws', () => {
        var parser = new Parser(true);
        var contentComponents = [
            new ContentComponentElement('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', [])
        ];

        expect(() => { parser.parse([], contentComponents); }).toThrow();
    });

    test('Component without data-id attribute throws', () => {
        var text = '<object type="application/kenticocloud" data-type="component"></object>';

        expect(() => { parse(text); }).toThrow();
    });

    theories = [
        { input: '<object type="application/kenticocloud" data-type="component" data-codename="a93d3570-6eb4-4f62-8ad3-2afead6ae62a"></object>' },
        { input: '<object type="application/kenticocloud" data-type="component" data-ide="a93d3570-6eb4-4f62-8ad3-2afead6ae62a"></object>' },
        { input: '<object type="application/kenticocloud" data-type="component" data-id="f2f417df"></object>' }
    ];
    theoretically('Components with 3 attributes but no data-id throw', theories, theory => {
        expect(() => { parse(theory.input); }).toThrow();
    });
});
