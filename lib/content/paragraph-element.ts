import { IContentElementWithText, IContentNode } from '../content';

export class ParagraphElement implements IContentElementWithText {
    childNodes: IContentNode[] = [];
}