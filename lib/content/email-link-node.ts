import { IContentNode, EntityNode } from '../content';

export class EmailLinkNode implements EntityNode {
    to: string = '';
    subject?: string;
    childNodes: IContentNode[] = [];

    constructor(data: Partial<EmailLinkNode>) {
        Object.assign(this, data);
    }
}