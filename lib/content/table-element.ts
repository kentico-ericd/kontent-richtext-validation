import { IContentElement, TableRowElement } from '../content';

export class TableElement implements IContentElement {
    rows: TableRowElement[] = [];
}