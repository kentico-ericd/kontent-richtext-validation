import { IContentNode, EntityNode } from '../content';
export declare class EmailLinkNode implements EntityNode {
    to: string;
    subject?: string;
    childNodes: IContentNode[];
    constructor(data: Partial<EmailLinkNode>);
}
