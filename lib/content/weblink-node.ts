import { IContentNode, WebLinkTargets, EntityNode } from '../content';

export class WebLinkNode implements EntityNode {
    childNodes: IContentNode[] = [];
    url: string;
    title: string;
    target: WebLinkTargets = WebLinkTargets.Self;

    constructor(url: string, target: WebLinkTargets, title: string) {
        this.url = url;
        this.target = target;
        this.title = title;
    }
}