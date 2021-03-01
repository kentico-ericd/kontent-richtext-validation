import { IContentNode, InlineStyle } from '../content';

export class InlineStyleNode implements IContentNode {
    childNodes: IContentNode[] = [];
    style: InlineStyle;

    constructor(style: InlineStyle) {
        this.style = style;
    }
}