import { IContentElement, IListItemElement, ListTypes } from '../content';
export declare class ListElement implements IContentElement, IListItemElement {
    type: ListTypes;
    items: IListItemElement[];
    constructor(type: ListTypes);
}
