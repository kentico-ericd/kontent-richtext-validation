"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var html_parser_1 = require("../lib/html-parser");
var jest_theories_1 = require("jest-theories");
describe('Scanner', function () {
    var scan = function (text) {
        var scanner = new html_parser_1.Scanner();
        return scanner.scan(text);
    };
    test('Empty string returns no tokens', function () {
        expect(scan('').length).toBe(0);
    });
    var theories = [
        { input: 'Hello' },
        { input: 'One two' },
        { input: 'One\ttwo' },
        { input: 'One\ntwo three' },
        { input: 'One\n\rtwo' },
        { input: "One two !@#$%^&*()_+,./;'\\[]" }
    ];
    jest_theories_1.default('Plain text returns 1 token', theories, function (theory) {
        var tokens = scan(theory.input);
        expect(tokens.length).toEqual(1);
        expect(tokens[0].content).toEqual(theory.input);
    });
    theories = [
        { input: '<b>', expected: 'b' },
        { input: '<h1>', expected: 'h1' },
        { input: '<strong>', expected: 'strong' },
        { input: '<div >', expected: 'div' },
        { input: '<FIGURE >', expected: 'FIGURE' }
    ];
    jest_theories_1.default('Simple opening tag returns start and end tokens', theories, function (theory) {
        var tokens = scan(theory.input);
        expect(tokens.length).toEqual(2);
        expect(tokens[0].content).toEqual(theory.expected);
        expect(tokens[0].type).toEqual(html_parser_1.TokenType.OpeningTagBeginning);
        expect(tokens[1].content).toEqual('');
        expect(tokens[1].type).toEqual(html_parser_1.TokenType.OpeningTagEnd);
    });
    theories = [
        { input: '<a b="c">', expectedAttributeName: 'b', expectedAttributeValue: 'c' },
        { input: '<a b="">', expectedAttributeName: 'b', expectedAttributeValue: '' },
        { input: '<strong power="squared">', expectedAttributeName: 'power', expectedAttributeValue: 'squared' },
        { input: '<div     data-custom="abc3.14 ">', expectedAttributeName: 'data-custom', expectedAttributeValue: 'abc3.14 ' },
        { input: '<IMG src="http://www.google.com">', expectedAttributeName: 'src', expectedAttributeValue: 'http://www.google.com' }
    ];
    jest_theories_1.default('Single opening tag with attribute returns correct attribute name and value', theories, function (theory) {
        var tokens = scan(theory.input);
        expect(tokens.length).toEqual(4);
        expect(tokens[1].content).toEqual(theory.expectedAttributeName);
        expect(tokens[2].content).toEqual(theory.expectedAttributeValue);
    });
    theories = [
        { input: '<a b>', expectedAttributeName: 'b' },
        { input: '<a b \t >', expectedAttributeName: 'b' },
        { input: '<strong power  >', expectedAttributeName: 'power' },
        { input: '<div     data-custom >', expectedAttributeName: 'data-custom' },
        { input: '<IMG src>', expectedAttributeName: 'src' }
    ];
    jest_theories_1.default('Single opening tag with attribute without value returns attribute name', theories, function (theory) {
        var tokens = scan(theory.input);
        expect(tokens.length).toEqual(3);
        expect(tokens[1].content).toEqual(theory.expectedAttributeName);
    });
    theories = [
        { input: '<a b/>', expectedAttributeName: 'b' },
        { input: '<a b \t />', expectedAttributeName: 'b' },
        { input: '<strong power  />', expectedAttributeName: 'power' },
        { input: '<div     data-custom />', expectedAttributeName: 'data-custom' },
        { input: '<IMG src/>', expectedAttributeName: 'src' }
    ];
    jest_theories_1.default('Single self-closing tag with attribute without value returns attribute name', theories, function (theory) {
        var tokens = scan(theory.input);
        expect(tokens.length).toEqual(3);
        expect(tokens[1].content).toEqual(theory.expectedAttributeName);
    });
    theories = [
        { input: '</b>', expected: 'b' },
        { input: '</strong>', expected: 'strong' },
        { input: '</div >', expected: 'div' },
        { input: '</FIGURE \t >', expected: 'FIGURE' }
    ];
    jest_theories_1.default('Single closing tag returns end token', theories, function (theory) {
        var tokens = scan(theory.input);
        expect(tokens.length).toEqual(1);
        expect(tokens[0].content).toEqual(theory.expected);
        expect(tokens[0].type).toEqual(html_parser_1.TokenType.ClosingTag);
    });
    theories = [
        { input: '<b/>', expected: 'b' },
        { input: '<br />', expected: 'br' },
        { input: '<div />', expected: 'div' },
        { input: '<FIGURE  \t />', expected: 'FIGURE' }
    ];
    jest_theories_1.default('Single self-closing tag returns start and end tokens', theories, function (theory) {
        var tokens = scan(theory.input);
        expect(tokens.length).toEqual(2);
        expect(tokens[0].content).toEqual(theory.expected);
        expect(tokens[0].type).toEqual(html_parser_1.TokenType.OpeningTagBeginning);
        expect(tokens[1].content).toEqual('');
        expect(tokens[1].type).toEqual(html_parser_1.TokenType.OpeningTagSelfClosing);
    });
    theories = [
        { input: '<a href="https://stackoverflow.com" class="current-site-link site-link js-gps-track" data-id="1" data-gps-track="site_switcher.click({ item_type:3 })"><div class="site-icon favicon favicon-stackoverflow" title="Stack Overflow"></div>Stack Overflow</a>', expected: 19 },
        { input: '<ul type="square"><li>Coffee</li><li>Tea</li><li>Milk</li></ul>', expected: 17 }
    ];
    jest_theories_1.default('Complex input returns correct number of tokens', theories, function (theory) {
        var tokens = scan(theory.input);
        expect(tokens.length).toEqual(theory.expected);
    });
    theories = [
        { input: 'a', expected: 1 },
        { input: 'ab', expected: 1 },
        { input: 'ab</cd>', expected: 2 },
        { input: 'ab</cd  >', expected: 2 },
        { input: 'ab</cd  ><ef>', expected: 4 },
        { input: 'ab</cd  ><ef/>', expected: 4 },
        { input: 'ab</cd  ><ef >', expected: 4 },
        { input: 'ab</cd  ><ef />', expected: 4 },
        { input: 'ab</cd  ><ef  />', expected: 4 },
        { input: 'ab</cd  ><ef  g>', expected: 5 },
        { input: 'ab</cd  ><ef  g/>', expected: 5 },
        { input: 'ab</cd  ><ef  gh>', expected: 5 },
        { input: 'ab</cd  ><ef  gh/>', expected: 5 },
        { input: 'ab</cd  ><ef  gh >', expected: 5 },
        { input: 'ab</cd  ><ef  gh />', expected: 5 },
        { input: 'ab</cd  ><ef  gh  >', expected: 5 },
        { input: 'ab</cd  ><ef  gh  />', expected: 5 },
        { input: 'ab</cd  ><ef  gh  i>', expected: 6 },
        { input: 'ab</cd  ><ef  gh  ij/>', expected: 6 },
        { input: 'ab</cd  ><ef  gh  i >', expected: 6 },
        { input: 'ab</cd  ><ef  gh  ij />', expected: 6 },
        { input: 'ab</cd  ><ef  gh  i="">', expected: 7 },
        { input: 'ab</cd  ><ef  gh  i="" >', expected: 7 },
        { input: 'ab</cd  ><ef  gh  i=""/>', expected: 7 },
        { input: 'ab</cd  ><ef  gh  i="" />', expected: 7 },
        { input: 'ab</cd  ><ef  gh  ij="">', expected: 7 },
        { input: 'ab</cd  ><ef  gh  ij="" >', expected: 7 },
        { input: 'ab</cd  ><ef  gh  ij=""/>', expected: 7 },
        { input: 'ab</cd  ><ef  gh  ij="" />', expected: 7 },
        { input: 'ab</cd  ><ef  gh  ij=" ">', expected: 7 },
        { input: 'ab</cd  ><ef  gh  ij="k" >', expected: 7 },
        { input: 'ab</cd  ><ef  gh  ij="k"/>', expected: 7 },
        { input: 'ab</cd  ><ef  gh  ij="kl">', expected: 7 },
        { input: 'ab</cd  ><ef  gh  ij="kl"/>', expected: 7 },
        { input: 'ab</cd  ><ef  gh  ij="kl" />', expected: 7 },
        { input: 'ab</cd  ><ef  gh  ij="kl" mn op="rst" /> uvx<y></z>', expected: 14 }
    ];
    jest_theories_1.default('FSM all transitions', theories, function (theory) {
        var tokens = scan(theory.input);
        expect(tokens.length).toEqual(theory.expected);
    });
});
//# sourceMappingURL=scanner.spec.js.map