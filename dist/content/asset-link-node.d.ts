import { EntityNode, IContentReference, IContentNode } from '../content';
export declare class AssetLinkNode implements EntityNode, IContentReference {
    id?: string;
    codename?: string;
    externalId?: string;
    childNodes: IContentNode[];
    constructor(data: Partial<AssetLinkNode>);
}
