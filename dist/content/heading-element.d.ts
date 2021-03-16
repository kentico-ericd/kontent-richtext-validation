import { IContentNode, IContentElementWithText } from '../content';
export declare class HeadingElement implements IContentElementWithText {
    childNodes: IContentNode[];
    level: number;
    constructor(level: number);
}
