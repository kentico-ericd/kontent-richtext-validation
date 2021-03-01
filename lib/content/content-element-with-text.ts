import { IContentElement, IContentNode } from '../content';

export interface IContentElementWithText extends IContentElement {
    childNodes: IContentNode[];
}