import { IContentElement, IListItemElement, ListTypes } from '../content';

export class ListElement implements IContentElement, IListItemElement {
    type: ListTypes;
    items: IListItemElement[] = [];

    constructor(type: ListTypes) {
        this.type = type;
    }
}