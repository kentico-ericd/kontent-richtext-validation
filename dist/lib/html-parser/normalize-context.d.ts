import { TextNode } from '../content';
export declare class NormalizeContext {
    lastTextNode: TextNode | null;
    hasContent: boolean;
    hasTrailingWhitespace: boolean;
    constructor(lastTextNode: TextNode | null, hasContent: boolean, hasTrailingWhitespace: boolean);
}
