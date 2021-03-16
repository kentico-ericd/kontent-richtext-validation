import { Reference, Token, Image } from '../html-parser';
import { TextNode, EntityNode, IContentElement, ContentComponentElement, ImageElement } from '../content';
export declare class ModelHelper {
    references: Reference[];
    private _whitespace;
    private _linkAttributes;
    private _emptyGuid;
    private _unsafeProtocols;
    private _guidRegex;
    private _whitespaceRegex;
    private _protocolRegex;
    constructor();
    createTextNode: (text: string) => TextNode;
    private normalizeWhiteSpaces;
    private setCharAt;
    createLink: (attributes: Record<string, string>, context: Token | null) => EntityNode | null;
    private throw;
    private resolveUri;
    createObjectElement: (attributes: Record<string, string>, context: Token | null, components?: ContentComponentElement[] | null | undefined) => IContentElement | null;
    private createContentModule;
    containsPair: (attributes: Record<string, string>, key: string, value: string) => boolean;
    createImageElement: (attributes: Record<string, string>, image: Image | null, context: Token | null) => ImageElement;
    private createContentComponent;
}
