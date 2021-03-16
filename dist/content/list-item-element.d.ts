import { IContentNode, IListItemElement, ListElement, IContentElementWithText } from '../content';
export declare class ListItemElement implements IListItemElement, IContentElementWithText {
    nestedList?: ListElement;
    childNodes: IContentNode[];
}
