import { IContentNode } from '../content';

export class TextNode implements IContentNode {
    childNodes: IContentNode[] = [];
    textContent: string;

    constructor(textContent: string = '') {
        this.textContent = textContent;
    }
}