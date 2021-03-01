import { IContentElement, IContentReference } from '../content';

export class ImageElement implements IContentElement, IContentReference {
    id?: string;
    codename?: string;
    externalId?: string;

    constructor(data: Partial<ImageElement>) {
        Object.assign(this, data);
    }
}