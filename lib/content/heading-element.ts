import { IContentNode, IContentElementWithText } from '../content';

export class HeadingElement implements IContentElementWithText
{
    childNodes: IContentNode[] = [];
    level: number;

    constructor(level: number) {
        this.level = level;
    }
}