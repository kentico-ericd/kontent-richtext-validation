import { ContentComponentTypeReference, IContentElement } from '../content';

export class ContentComponentElement implements IContentElement {
    id: string;
    type: ContentComponentTypeReference;
    componentElements: any;

    constructor(itemId: string, typeId: string, componentElements: any) {
        this.id = itemId;
        this.type = new ContentComponentTypeReference(typeId);
        this.componentElements = componentElements;
    }
}