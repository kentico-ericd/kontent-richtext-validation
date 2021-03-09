import theoretically from 'jest-theories';
import { HtmlConverter } from '../lib/html-converter/html-converter';

describe('HtmlConverter', () => {
    const assert = (input: string, expected: string, strict: boolean = true) => {
        const converter = new HtmlConverter(strict);
        const model = converter.convertFromHtml(input);
        const output = converter.convertToHtml(model);

        expect(output).toEqual(expected);
    };

    let theories: any[] = [
        { input: '<p>text</p>', expected: '<p>text</p>' }
    ];
    theoretically('Paragraph element', theories, theory => assert(theory.input, theory.expected));

    theories = [
        { input: '<h1>text</h1>', expected: '<h1>text</h1>' },
        { input: '<h2>text</h2>', expected: '<h2>text</h2>' },
        { input: '<h3>text</h3>', expected: '<h3>text</h3>' },
        { input: '<h4>text</h4>', expected: '<h4>text</h4>' }
    ];
    theoretically('Heading element', theories, theory => assert(theory.input, theory.expected));

    theories = [
        { input: '<ul><li>text</li></ul>', expected: '<ul>\n  <li>text</li>\n</ul>' },
        { input: '<ol><li>text</li></ol>', expected: '<ol>\n  <li>text</li>\n</ol>' }
    ];
    theoretically('Listing element', theories, theory => assert(theory.input, theory.expected));

    theories = [
        {
            input: `
<ul>
    <li>text
        <ol>
            <li>another text</li>
        </ol>
    </li>
</ul>`, expected: '<ul>\n  <li>text\n    <ol>\n      <li>another text</li>\n    </ol>\n  </li>\n</ul>'
        },
        {
            input: `
<ul>
    <li>text
        <ol>
            <li>another text
                <ul>
                    <li>yet another text</li>
                </ul>
            </li>
        </ol>
    </li>
</ul>`, expected: '<ul>\n  <li>text\n    <ol>\n      <li>another text\n        <ul>\n          <li>yet another text</li>\n        </ul>\n      </li>\n    </ol>\n  </li>\n</ul>'
        },
        {
            strict: false, input: `
<ul>
    <li>text
        <ol>
            <li>another text
                <ul>
                    <li>yet another text</li>
                </ul>
            </li>
        </ol>
    </li>
    <ol>
        <li>non-strict text</li>
        <ul>
            <li>yet another non-strict text</li>
        </ul>
    </ol>
</ul>`, expected: '<ul>\n  <li>text\n    <ol>\n      <li>another text\n        <ul>\n          <li>yet another text</li>\n        </ul>\n      </li>\n    </ol>\n  </li>\n  <ol>\n    <li>non-strict text</li>\n    <ul>\n      <li>yet another non-strict text</li>\n    </ul>\n  </ol>\n</ul>'
        }
    ];
    theoretically('Nested listing element', theories, theory => assert(theory.input, theory.expected, theory.strict));

    theories = [
        { input: '<table><tbody><tr><td>A1</td><td>A2</td></tr><tr><td><p>B1</p></td><td><h1>B21</h1><p>B22</p></td></tr></tbody></table>', expected: '<table><tbody>\n  <tr><td>A1</td><td>A2</td></tr>\n  <tr><td>B1</td><td><h1>B21</h1>\n<p>B22</p>\n</td></tr>\n</tbody></table>' }
    ];
    theoretically('Table element', theories, theory => assert(theory.input, theory.expected));

    theories = [
        {
            input: '<figure data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"><img src="#" data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"></figure>',
            expected: '<figure data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"><img src="#" data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"></figure>'
        },
        {
            input: '<figure data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"><img data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"></figure>',
            expected: '<figure data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"><img src="#" data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"></figure>'
        },
        {
            input: '<figure data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"><img></figure>',
            expected: '<figure data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"><img src="#" data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"></figure>'
        },
        {
            input: '<figure data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"></figure>',
            expected: '<figure data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"><img src="#" data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"></figure>'
        },
        {
            input: '<figure data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"><img src=""></figure>',
            expected: '<figure data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"><img src="#" data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"></figure>'
        },
        {
            input: '<figure data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"><img src=" "></figure>',
            expected: '<figure data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"><img src="#" data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"></figure>'
        }];
        theoretically('Image element', theories, theory => assert(theory.input, theory.expected));

});