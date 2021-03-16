import { IContentNode, WebLinkTargets, EntityNode } from '../content';
export declare class WebLinkNode implements EntityNode {
    childNodes: IContentNode[];
    url: string;
    title: string;
    target: WebLinkTargets;
    constructor(url: string, target: WebLinkTargets, title: string);
}
