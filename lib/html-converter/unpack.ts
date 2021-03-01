import { HtmlConverter } from "../html-converter";
import { RichTextContentModel, ContentComponentElement } from '../content';
import { Scanner, Parser } from '../html-parser';

export class Unpack extends HtmlConverter {
    convertFromHtml = (value: string, contentComponents?: ContentComponentElement[] | null): RichTextContentModel => {
        var scanner = new Scanner();
        var tokens = scanner.scan(value);

        var parser = new Parser(this.strict);
        var model = parser.parse(tokens, contentComponents);

        return model;
    }
}