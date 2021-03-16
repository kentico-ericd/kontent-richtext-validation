import { IContentElement, IContentReference } from '../content';
export declare class ImageElement implements IContentElement, IContentReference {
    id?: string;
    codename?: string;
    externalId?: string;
    constructor(data: Partial<ImageElement>);
}
