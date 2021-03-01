import { IContentNode } from '../content';

export abstract class EntityNode implements IContentNode {
    childNodes: IContentNode[] = [];
}