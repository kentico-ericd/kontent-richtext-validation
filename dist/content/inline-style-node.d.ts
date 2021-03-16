import { IContentNode, InlineStyle } from '../content';
export declare class InlineStyleNode implements IContentNode {
    childNodes: IContentNode[];
    style: InlineStyle;
    constructor(style: InlineStyle);
}
