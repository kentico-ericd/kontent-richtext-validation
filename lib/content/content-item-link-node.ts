import { EntityNode, IContentReference, IContentNode } from '../content';

export class ContentItemLinkNode implements EntityNode, IContentReference {
    id?: string;
    codename?: string;
    externalId?: string;
    childNodes: IContentNode[] = [];

    constructor(data: Partial<ContentItemLinkNode>) {
        Object.assign(this, data);
    }
}