import { IContentElement, IContentReference } from '../content';
export declare class ContentModuleElement implements IContentElement, IContentReference {
    id?: string;
    codename?: string;
    externalId?: string;
    constructor(data: Partial<ContentModuleElement>);
}
