import { IContentReference } from '../content/index';
import { ReferenceContext } from './index';
export declare class Reference {
    contentReference: IContentReference;
    referenceContext?: ReferenceContext | null;
    constructor(contentReference: IContentReference, referenceContext?: ReferenceContext | null);
}
