import { encode } from 'html-entities';
import { HtmlConverter } from '../html-converter';
import { isNullOrWhitespace } from '../html-parser';
import {
    InlineStyle,
    RichTextContentModel,
    IContentElement,
    ParagraphElement,
    HeadingElement,
    ListElement,
    TableElement,
    ImageElement,
    ContentModuleElement,
    ContentComponentElement,
    IContentNode,
    TextNode,
    LineBreakNode,
    InlineStyleNode,
    EntityNode,
    WebLinkNode,
    EmailLinkNode,
    ContentItemLinkNode,
    AssetLinkNode,
    WebLinkTargets,
    ListTypes,
    IListItemElement,
    ListItemElement,
    TableRowElement,
    TableCellElement
} from '../content';

export class Pack extends HtmlConverter {

    static tagsByInlineStyle: Record<InlineStyle, string> = {
        [InlineStyle.Bold]: 'strong',
        [InlineStyle.Italic]: 'em',
        [InlineStyle.Subscript]: 'sub',
        [InlineStyle.Superscript]: 'sup',
        [InlineStyle.Code]: 'code'
    };

    convertToHtml = (content: RichTextContentModel): string => {
        let text: string = '';

        text = this.visitElements(content.elements, text);

        if (text.length === 0) {
            text += '<p><br/></p>';
        }
        else {
            // Remove the trailing end of line
            text = text.slice(0, -1);
        }

        return text;
    }

    private visitElements = (elements: IContentElement[], text: string): string => {
        for (const element of elements) {
            switch (element.constructor) {
                case ParagraphElement: text += this.visitParagraph(<ParagraphElement>element, text); break;
                case HeadingElement: text += this.visitHeading(<HeadingElement>element, text); break;
                case ListElement: text += this.visitList(<ListElement>element, text); break;
                case TableElement: text += this.visitTable(<TableElement>element, text); break;
                case ImageElement: text += this.visitImage(element, text); break;
                case ContentModuleElement: text += this.visitContentModule(element, text); break;
                case ContentComponentElement: text += this.visitContentComponent(<ContentComponentElement>element, text); break;
                default: throw new Error(`Unrecognized content element type: ${typeof element}"`);
            }
        }

        return text;
    }

    private appendIndent = (indent: number, text: string): string => {
        for (var i = 0; i < indent * 2; i++) {
            text += ' ';
        }

        return text;
    }

    private visitImage = (element: ImageElement, text: string): string => {
        return text + `<figure data-asset-id="${element.id}"><img src="#" data-asset-id="${element.id}"></figure>\n`;
    }

    private visitContentModule = (element: ContentModuleElement, text: string): string => {
        return text + `<object type="application/kenticocloud" data-type="item" data-id="${element.id}"></object>\n`;
    }

    private visitContentComponent = (element: ContentComponentElement, text: string): string => {
        return text + `<object type="application/kenticocloud" data-type="component" data-id="${element.id}"></object>\n`;
    }

    private visitTable = (element: TableElement, text: string): string => {
        text += '<table><tbody>\n';
        for (const row of element.rows) {
            text += this.visitTableRow(row, text);
        }

        return text + '</tbody></table>\n';
    }

    private visitTableRow = (row: TableRowElement, text: string): string => {
        text += this.appendIndent(1, text);
        text += '<tr>';
        for (const cell of row.cells) {
            text += this.visitTableCell(cell, text);
        }

        return text + '</tr>\n';
    }

    private visitTableCell = (cell: TableCellElement, text: string): string => {
        text += '<td>';
        text += this.visitNestedContent(cell.childElements, text);

        return text + '</td>';
    }

    private visitList = (element: ListElement, text: string, indent: number = 0): string => {
        switch (element.type) {
            case ListTypes.Unordered: return text + this.visitUnorderedList(element, indent, text);
            case ListTypes.Ordered: return text + this.visitOrderedList(element, indent, text);
            default: throw new Error(`Unrecognized list type: ${element.type}`);
        }
    }

    private visitUnorderedList = (element: ListElement, indent: number, text: string): string => {
        text += this.appendIndent(indent, text);
        text += '<ul>\n';
        text += this.visitListItems(element.items, indent + 1, text);
        text += this.appendIndent(indent, text);

        return text + '</ul>\n';
    }

    private visitOrderedList = (element: ListElement, indent: number, text: string): string => {
        text += this.appendIndent(indent, text);
        text += '<ol>\n';
        text += this.visitListItems(element.items, indent + 1, text);
        text += this.appendIndent(indent, text);

        return text + '</ol>\n';
    }

    private visitListItems = (items: IListItemElement[], indent: number, text: string): string => {
        for (const item of items) {
            if (item instanceof ListItemElement) {
                text += this.appendIndent(indent, text);
                text += '<li>';
                text += this.visitElementNodes(item.childNodes, text);

                if (item.nestedList) {
                    text += '\n';
                    text += this.visitList(item.nestedList, text, indent + 1);
                    text += this.appendIndent(indent, text);
                }

                text += '</li>\n';
            }
            else if (item instanceof ListElement) {
                text += this.visitList(item, text, indent);
            }
            else throw new Error(`Unrecognized list item type: ${typeof item}`);
        }

        return text;
    }

    private visitParagraph = (element: ParagraphElement, text: string): string => {
        text += '<p>';
        text += this.visitElementNodes(element.childNodes, text);
        
        return text + '</p>\n';
    }

    private visitHeading = (element: HeadingElement, text: string): string => {
        text += `<h${element.level}>`;
        text += this.visitElementNodes(element.childNodes, text);
        
        return text + `</h${element.level}>\n`;
    }

    private visitNestedContent = (elements: IContentElement[], text: string): string => {
        if (elements.length === 1) {
            // Single paragraph content does not include the wrapping P tag in the output for backward compatibility
            const singleElement = elements[0];
            switch (singleElement) {
                case ParagraphElement:
                    return text + this.visitElementNodes((<ParagraphElement>singleElement).childNodes, text);
            }
        }
        
        return text + this.visitElements(elements, text);
    }

    private visitElementNodes = (nodes: IContentNode[], text: string): string => {
        if (nodes.length === 0 || (nodes.length === 1 && nodes[0] instanceof TextNode && (<TextNode>nodes[0]).textContent.length === 0)) {
            return text + '<br/>';
        }
        else {
            return text + this.visitNodes(nodes, text);
        }
    }

    private visitNodes = (nodes: IContentNode[], text: string): string => {
        for (const node of nodes) {
            switch (node.constructor) {
                case TextNode: text += this.visitTextNode(<TextNode>node, text); break;
                case LineBreakNode: text += this.visitLineBreakNode(text); break;
                case InlineStyleNode: text += this.visitInlineStyleNode(<InlineStyleNode>node, text); break;
                case EntityNode: text += this.visitEntityNode(node, text); break;
                default: throw new Error(`Unrecognized node type: ${typeof node}`);
            }
        }

        return text;
    }

    private visitTextNode = (node: TextNode, text: string): string => {
        return text + node.textContent;
    }

    private visitLineBreakNode = (text: string): string => {
        return text + '<br/>';
    }

    private visitInlineStyleNode = (node: InlineStyleNode, text: string): string => {
        const tag = Pack.tagsByInlineStyle[node.style];
        if (!tag) {
            throw new Error(`Unrecognized inline style: ${node.style}`);
        }

        text += `<${tag}>`;
        text += this.visitNodes(node.childNodes, text);
        
        return text + `</${tag}>`;
    }

    private visitEntityNode = (node: EntityNode, text: string): string => {
        switch (node.constructor) {
            case WebLinkNode: return text + this.visitWebLinkNode(<WebLinkNode>node, text);
            case EmailLinkNode: return text + this.visitEmailLinkNode(node, text);
            case ContentItemLinkNode: return text + this.visitContentItemLinkNode(node, text);
            case AssetLinkNode: return text + this.visitAssetLinkNode(node, text);
            default: throw new Error(`Unrecognized entity type: ${typeof node}`);
        }
    }

    private visitWebLinkNode = (node: WebLinkNode, text: string): string => {
        text += `<a href="${node.url}"`;
        switch (node.target) {
            case WebLinkTargets.Self: break;
            case WebLinkTargets.Blank: text += ' data-new-window="true"'; break;
            default: throw new Error(`Unrecognized URL link target: ${node.target}`);
        }

        if (!isNullOrWhitespace(node.title)) {
            text += ` title="${encode(node.title)}"`;
        }

        text += '>';
        text += this.visitNodes(node.childNodes, text);
        
        return text + '</a>';
    }

    private visitEmailLinkNode = (node: EmailLinkNode, text: string): string => {
        text += `<a data-email-address="${node.to}"`;
        if (!isNullOrWhitespace(node.subject)) {
            text += `data-email-subject="${node.subject}"`;
        }

        text += '>';
        text += this.visitNodes(node.childNodes, text);
        
        return text + '</a>';
    }

    private visitContentItemLinkNode = (node: ContentItemLinkNode, text: string): string => {
        text += `<a data-item-id="${node.id}">`;
        text += this.visitNodes(node.childNodes, text);
        
        return text + '</a>';
    }

    private visitAssetLinkNode = (node: AssetLinkNode, text: string): string => {
        text += `<a data-asset-id="${node.id}">`;
        text += this.visitNodes(node.childNodes, text);
        
        return text + '</a>';
    }
}