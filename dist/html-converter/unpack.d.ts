import { HtmlConverter } from "../html-converter";
import { RichTextContentModel, ContentComponentElement } from '../content';
export declare class Unpack extends HtmlConverter {
    convertFromHtml: (value: string, contentComponents?: ContentComponentElement[] | null | undefined) => RichTextContentModel;
}
