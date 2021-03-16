import { ContentComponentTypeReference, IContentElement } from '../content';
export declare class ContentComponentElement implements IContentElement {
    id: string;
    type: ContentComponentTypeReference;
    componentElements: any;
    constructor(itemId: string, typeId: string, componentElements: any);
}
