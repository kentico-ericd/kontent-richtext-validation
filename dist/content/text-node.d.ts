import { IContentNode } from '../content';
export declare class TextNode implements IContentNode {
    childNodes: IContentNode[];
    textContent: string;
    constructor(textContent?: string);
}
