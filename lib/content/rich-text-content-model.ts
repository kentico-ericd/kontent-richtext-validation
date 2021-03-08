import { IContentElement } from '../content';
import { Reference } from '../html-parser';

export class RichTextContentModel {
    elements: IContentElement[] = [];
    references: Reference[] = [];

    constructor(elements: IContentElement[] = []) {
        this.elements = elements;
    }
}