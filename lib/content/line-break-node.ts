import { IContentNode } from '../content';

export class LineBreakNode implements IContentNode {
    childNodes: IContentNode[] = [];
}