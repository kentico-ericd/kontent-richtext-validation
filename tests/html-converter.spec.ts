import theoretically from 'jest-theories';
import { HtmlConverter } from '../lib/html-converter';

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
        {
            input: '<table><tbody><tr><td>A1</td><td>A2</td></tr><tr><td><p>B1</p></td><td><h1>B21</h1><p>B22</p></td></tr></tbody></table>',
            expected: '<table><tbody>\n  <tr><td>A1</td><td>A2</td></tr>\n  <tr><td>B1</td><td><h1>B21</h1>\n<p>B22</p>\n</td></tr>\n</tbody></table>'
        }
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
        }
    ];
    theoretically('Image element', theories, theory => assert(theory.input, theory.expected));

    theories = [
        {
            input: '<object type="application/kenticocloud" data-type="item" data-id="7819dd59-1aa3-4c03-9d32-172c40167f77"></object>',
            expected: '<object type="application/kenticocloud" data-type="item" data-id="7819dd59-1aa3-4c03-9d32-172c40167f77"></object>'
        }
    ];
    theoretically('Content module element', theories, theory => assert(theory.input, theory.expected));

    theories = [
        { input: '<p>text</p>', expected: '<p>text</p>' },
        { input: '<p></p>', expected: '<p><br/></p>' },
        { input: '<p> \n yet \r another \f text </p>', expected: '<p>yet another text</p>' },
        { input: '<p> \n \r \f \t </p>', expected: '<p><br/></p>' }
    ];
    theoretically('Text node', theories, theory => assert(theory.input, theory.expected));

    theories = [
        { input: '<p><br/></p>', expected: '<p><br/></p>' },
        { input: '<p><br/><br/><br/>text</p>', expected: '<p><br/><br/><br/>text</p>' },
        { input: '<p>  <br/>  <br/>  <br/>  text  </p>', expected: '<p><br/><br/><br/>text</p>' }
    ];
    theoretically('Line break node', theories, theory => assert(theory.input, theory.expected));

    theories = [
        { input: '<p><strong>text</strong></p>', expected: '<p><strong>text</strong></p>' },
        { input: '<p><em>text</em></p>', expected: '<p><em>text</em></p>' },
        {
            input: '<p><strong><em>text</em></strong> <em><em>another text</em></em></p>',
            expected: '<p><strong><em>text</em></strong> <em><em>another text</em></em></p>'
        }
    ];
    theoretically('Inline style node', theories, theory => assert(theory.input, theory.expected));

    theories = [
        { input: '<p><a href="link">text</a></p>', expected: '<p><a href="http://link">text</a></p>' },
        { input: '<p><a href="link" data-new-window="true">text</a></p>', expected: '<p><a href="http://link" data-new-window="true">text</a></p>' },
        { input: '<p><a href="link" data-new-window="false">text</a></p>', expected: '<p><a href="http://link">text</a></p>' },
        { input: '<p><a href="link" data-new-window="TRUE">text</a></p>', expected: '<p><a href="http://link" data-new-window="true">text</a></p>' },
        { input: '<p><a href="link" data-new-window="FALSE">text</a></p>', expected: '<p><a href="http://link">text</a></p>' },
        { input: '<p><a href="http://example.org">text</a></p>', expected: '<p><a href="http://example.org">text</a></p>' },
        { input: '<p><a href="example.org">text</a></p>', expected: '<p><a href="http://example.org">text</a></p>' },
        { input: '<p><a href="https://example.org">text</a></p>', expected: '<p><a href="https://example.org">text</a></p>' },
        { input: '<p><a href="/bio.html">text</a></p>', expected: '<p><a href="/bio.html">text</a></p>' },
        { input: '<p><a href="?where">text</a></p>', expected: '<p><a href="?where">text</a></p>' },
        { input: '<p><a href="#anchor">text</a></p>', expected: '<p><a href="#anchor">text</a></p>' },
        { input: '<p><a href="javascript:alert()">text</a></p>', expected: '<p><a href="http://javascript:alert()">text</a></p>' },
        { input: '<p><a href="javascript://%0aalert()">text</a></p>', expected: '<p><a href="http://javascript://%0aalert()">text</a></p>' },
        {
            input: '<p><a href="data:text/html,<script>alert()</script>">text</a></p>',
            expected: '<p><a href="http://data:text/html,<script>alert()</script>">text</a></p>'
        },
        {
            input: '<p><a href="http://example.org" title="my title">text</a></p>',
            expected: '<p><a href="http://example.org" title="my title">text</a></p>'
        },
        {
            input: '<p><a href="http://example.org" data-new-window="true" title="my title">text</a></p>',
            expected: '<p><a href="http://example.org" data-new-window="true" title="my title">text</a></p>'
        }
    ];
    theoretically('Web link node', theories, theory => assert(theory.input, theory.expected));

    theories = [
        { input: '<p><a data-email-address="to">text</a></p>', expected: '<p><a data-email-address="to">text</a></p>' },
        { input: '<p><a data-email-address="to" data-email-subject="subject">text</a></p>', expected: '<p><a data-email-address="to" data-email-subject="subject">text</a></p>' },
        { input: '<p><a data-email-address="to" data-email-subject=" ">text</a></p>', expected: '<p><a data-email-address="to" data-email-subject=" ">text</a></p>' },
        { input: '<p><a data-email-address="to" data-email-subject="">text</a></p>', expected: '<p><a data-email-address="to">text</a></p>' }
    ];
    theoretically('Email link node', theories, theory => assert(theory.input, theory.expected));

    theories = [
        { input: '<p><a data-item-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e">text</a></p>', expected: '<p><a data-item-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e">text</a></p>' }
    ];
    theoretically('Content item link node', theories, theory => assert(theory.input, theory.expected));

    theories = [
        { input: '<p><a data-asset-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e">text</a></p>', expected: '<p><a data-asset-id="b27a1822-f69c-441d-b63b-cdb0a0542d0e">text</a></p>' }
    ];
    theoretically('Asset link node', theories, theory => assert(theory.input, theory.expected));

    theories = [
        { input: '<p> \t\n\r\f some \t\n\r\f text \t\n\r\f </p>', expected: '<p>some text</p>' },
        { input: '<p> <strong> \t\n\r\f some \t\n\r\f </strong> <em> text \t\n\r\f </em> </p>', expected: '<p><strong>some</strong> <em>text</em></p>' },
        { input: '<p>  <a    href="link"    >   text    </a>    </p>', expected: '<p><a href="http://link">text</a></p>' }
    ];
    theoretically('Whitespace', theories, theory => assert(theory.input, theory.expected));

    theories = [
        { input: '<p>&amp;&lt;&gt;&nbsp;</p>', expected: '<p>&amp;&lt;&gt;&nbsp;</p>' },
        { input: '<p>&#70;&quot;</p>', expected: '<p>F"</p>' },
        { input: '<p><a href="<&lt;&amp;&nbsp;&quot;&gt;>">text</a></p>', expected: '<p><a href="http://<<&amp;&nbsp;&quot;>>">text</a></p>' },
        { input: '<p>&laquo;text&raquo;</p>', expected: '<p>«text»</p>' }
    ];
    theoretically('Character reference', theories, theory => assert(theory.input, theory.expected));

    theories = [
        { input: '<p>&nbsp;<a href="&nbsp;link">text</a></p>', expected: '<p>&nbsp;<a href="http://&nbsp;link">text</a></p>'},
        { input: '<p>&#160;<a href="&#160;link">text</a></p>', expected: '<p>&nbsp;<a href="http://&nbsp;link">text</a></p>'},
        { input: '<p>\u00A0<a href="\u00A0link">text</a></p>', expected: '<p>&nbsp;<a href="http://&nbsp;link">text</a></p>'}
    ];
    theoretically('Non-breaking space', theories, theory => assert(theory.input, theory.expected));

    theories = [{input: '',  expected: '<p><br/></p>' }];
    theoretically('Empty fragment', theories, theory => assert(theory.input, theory.expected));

    theories = [
        { input: '<P>text</P>', expected: '<p>text</p>' },
        { input: '<P>text</p>', expected: '<p>text</p>' },
        { input: '<p><A HREF="link">text</a></p>', expected: '<p><a href="http://link">text</a></p>' }
    ];
    theoretically('Case insensitive', theories, theory => assert(theory.input, theory.expected));

});