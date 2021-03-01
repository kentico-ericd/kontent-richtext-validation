import { IContentNode, IListItemElement, ListElement, IContentElementWithText } from '../content';

export class ListItemElement implements IListItemElement, IContentElementWithText {
    nestedList?: ListElement;
    childNodes: IContentNode[] = [];
}