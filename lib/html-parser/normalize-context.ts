import { TextNode } from '../content';

export class NormalizeContext {
    lastTextNode: TextNode | null;
    hasContent: boolean;
    hasTrailingWhitespace: boolean;

    constructor(lastTextNode: TextNode | null, hasContent: boolean, hasTrailingWhitespace: boolean) {
        this.lastTextNode = lastTextNode;
        this.hasContent = hasContent;
        this.hasTrailingWhitespace = hasTrailingWhitespace;
    }
}