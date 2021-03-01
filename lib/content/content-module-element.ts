import { IContentElement, IContentReference } from '../content';

export class ContentModuleElement implements IContentElement, IContentReference {
    id?: string;
    codename?: string;
    externalId?: string;

    constructor(data: Partial<ContentModuleElement>) {
        Object.assign(this, data);
    }
}