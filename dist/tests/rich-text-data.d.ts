import { IContentElement, ContentComponentElement, TableElement } from '../lib/content';
export declare class RichTextData {
    static textHtml: string;
    static imageHtml: string;
    static imageElement: IContentElement;
    static modularContentHtml: string;
    static modularContentElement: IContentElement;
    static contentComponentHtml: string;
    static contentComponentElement: ContentComponentElement;
    static simpleTableHtml: string;
    static addTextElements: () => IContentElement[];
    static addListElements: (strictNested: boolean, nonStrictNested: boolean, trailingListItem: boolean) => IContentElement[];
    static getListsHtml: (strictNested: boolean, nonStrictNested: boolean, trailingListItem: boolean) => string;
    static createTableElement: (callback: () => IContentElement[]) => TableElement;
}
