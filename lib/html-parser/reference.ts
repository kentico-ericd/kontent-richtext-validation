import { IContentReference } from '../content/index';
import { ReferenceContext } from './index';

export class Reference {
    contentReference: IContentReference;
    referenceContext?: ReferenceContext | null;

    constructor(contentReference: IContentReference, referenceContext?: ReferenceContext | null) {
        this.contentReference = contentReference;
        this.referenceContext = referenceContext;
    }
}