import {
    IContentElement,
    ParagraphElement,
    TextNode,
    HeadingElement,
    InlineStyleNode,
    InlineStyle,
    LineBreakNode,
    WebLinkNode,
    ContentItemLinkNode,
    WebLinkTargets,
    EmailLinkNode,
    AssetLinkNode,
    ListElement,
    ListItemElement,
    ListTypes,
    ImageElement,
    ContentComponentElement,
    RichTextContentModel,
    IContentElementWithText,
    TableElement,
    TableRowElement,
    TableCellElement,
    ContentModuleElement
} from '../lib/content';

export class RichTextData {
    static textHtml = `<p>Simple paragraph.</p>
<p> Paragraph &nbsp;&nbsp;with   spaces. </p>
<h1>H1</h1>
<h2>
H2
</h2>
<h3>H3</h3>
<h4>H4</h4>
<p>Text with <strong>bold</strong> and <em>italic</em> and <em>some </em><em><strong>mixed</strong></em><em> ones</em> 2<sup>superscript</sup> x<sub>subscript</sub> and <code>code</code> and<strong><em><sup>even bold italic superscript</sup></em></strong> and<br/>
a new line.</p>
<p>Some special characters &lt; &gt; &amp; " ' and some more: &amp;amp;</p>
<p>Text with a <a href="http://www.kentico.com">URL link</a>, a <a href="http://www.kentico.com" data-new-window="true">URL link that opens in a new window</a>, a <a data-item-id="7819dd59-1aa3-4c03-9d32-172c40167f77">content item link</a>, an <a data-email-address="info@kentico.com" data-email-subject="Hi there!">e-mail link</a> and an <a data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444">asset link</a>.</p>
`;
    static imageHtml = `<figure data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"><img src="#" data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444"></figure>`;
    static imageElement: IContentElement = new ImageElement({ id: '30a3a8c2-e9ab-47c2-84f4-e470985a3444' });
    static modularContentHtml = '<object type="application/kenticocloud" data-type="item" data-id="a815faa5-009e-489b-b8bb-a7f3dda0e047"></object>';
    static modularContentElement: IContentElement = new ContentModuleElement({ id: 'a815faa5-009e-489b-b8bb-a7f3dda0e047' });
    static contentComponentHtml = '<object type="application/kenticocloud" data-type="component" data-id="7819dd59-1aa3-4c03-9d32-172c40167f77"></object>';
    static contentComponentElement: ContentComponentElement = new ContentComponentElement(
        '7819dd59-1aa3-4c03-9d32-172c40167f77',
        '08ab71bb-e7ef-408f-9f3b-25c525814e3b',
        [new RichTextContentModel([new ParagraphElement()])]
    );
    static simpleTableHtml = `<table><tbody>
    <tr><td>Name</td><td>Surname</td></tr>
    <tr><td>
  A
  </td><td>B</td></tr>
    <tr><td>C</td><td>
  D
  </td></tr>
  </tbody></table>`;

    static addTextElements = (): IContentElement[] => {
        const elements = [];

        // Simple paragraph
        const pSimple = new ParagraphElement();
        pSimple.childNodes.push(new TextNode('Simple paragraph.'));
        elements.push(pSimple);

        // Paragraph with spaces
        const pWithSpaces = new ParagraphElement();
        pWithSpaces.childNodes.push(new TextNode('Paragraph   with spaces.'));
        elements.push(pWithSpaces);

        // H1
        const h1 = new HeadingElement(1);
        h1.childNodes.push(new TextNode('H1'));
        elements.push(h1);

        // H2
        const h2 = new HeadingElement(2);
        h2.childNodes.push(new TextNode('H2'));
        elements.push(h2);

        // H3
        const h3 = new HeadingElement(3);
        h3.childNodes.push(new TextNode('H3'));
        elements.push(h3);

        // H4
        const h4 = new HeadingElement(4);
        h4.childNodes.push(new TextNode('H4'));
        elements.push(h4);

        // Paragraph with inline styles
        const pWithInlineStyles = new ParagraphElement();
        pWithInlineStyles.childNodes.push(new TextNode('Text with '));

        const secondNode = new InlineStyleNode(InlineStyle.Bold);
        secondNode.childNodes.push(new TextNode('bold'));
        pWithInlineStyles.childNodes.push(secondNode);

        pWithInlineStyles.childNodes.push(new TextNode(' and '));

        const fourthNode = new InlineStyleNode(InlineStyle.Italic);
        fourthNode.childNodes.push(new TextNode('italic'));
        pWithInlineStyles.childNodes.push(fourthNode);

        pWithInlineStyles.childNodes.push(new TextNode(' and '));

        const sixthNode = new InlineStyleNode(InlineStyle.Italic);
        sixthNode.childNodes.push(new TextNode('some '));
        pWithInlineStyles.childNodes.push(sixthNode);

        const seventhNode = new InlineStyleNode(InlineStyle.Italic);
        const seventhInnerNode = new InlineStyleNode(InlineStyle.Bold);
        seventhInnerNode.childNodes.push(new TextNode('mixed'));
        seventhNode.childNodes.push(seventhInnerNode);
        pWithInlineStyles.childNodes.push(seventhNode);

        const eighthNode = new InlineStyleNode(InlineStyle.Italic);
        eighthNode.childNodes.push(new TextNode(' ones'));
        pWithInlineStyles.childNodes.push(eighthNode);

        pWithInlineStyles.childNodes.push(new TextNode(' 2'));

        const ninthNode = new InlineStyleNode(InlineStyle.Superscript);
        ninthNode.childNodes.push(new TextNode('superscript'));
        pWithInlineStyles.childNodes.push(ninthNode);

        pWithInlineStyles.childNodes.push(new TextNode(' x'));

        const tenthNode = new InlineStyleNode(InlineStyle.Subscript);
        tenthNode.childNodes.push(new TextNode('subscript'));
        pWithInlineStyles.childNodes.push(tenthNode);

        pWithInlineStyles.childNodes.push(new TextNode(' and '));

        const eleventhNode = new InlineStyleNode(InlineStyle.Code);
        eleventhNode.childNodes.push(new TextNode('code'));
        pWithInlineStyles.childNodes.push(eleventhNode);

        pWithInlineStyles.childNodes.push(new TextNode(' and'));

        const twelfthNode = new InlineStyleNode(InlineStyle.Bold);
        const twelfthInnerNode1 = new InlineStyleNode(InlineStyle.Italic);
        const twelfthInnerNode2 = new InlineStyleNode(InlineStyle.Superscript);
        twelfthInnerNode2.childNodes.push(new TextNode('even bold italic superscript'));
        twelfthInnerNode1.childNodes.push(twelfthInnerNode2);
        twelfthNode.childNodes.push(twelfthInnerNode1);
        pWithInlineStyles.childNodes.push(twelfthNode);

        pWithInlineStyles.childNodes.push(new TextNode(' and'));
        pWithInlineStyles.childNodes.push(new LineBreakNode());
        pWithInlineStyles.childNodes.push(new TextNode('a new line.'));

        elements.push(pWithInlineStyles);

        // Paragraph with special chars
        const pWithSpecialChars = new ParagraphElement();
        pWithSpecialChars.childNodes.push(new TextNode(`Some special characters < > & " ' and some more: &amp;`));
        elements.push(pWithSpecialChars);

        // Paragraph with links
        const pWithLinks = new ParagraphElement();
        pWithLinks.childNodes.push(new TextNode('Text with a '));

        var webLinkNode = new WebLinkNode('http://www.kentico.com');
        webLinkNode.childNodes.push(new TextNode('URL link'));
        pWithLinks.childNodes.push(webLinkNode);

        pWithLinks.childNodes.push(new TextNode(', a '));

        webLinkNode = new WebLinkNode('http://www.kentico.com', WebLinkTargets.Blank);
        webLinkNode.childNodes.push(new TextNode('URL link that opens in a new window'));
        pWithLinks.childNodes.push(webLinkNode);

        pWithLinks.childNodes.push(new TextNode(', a '));

        var contentItemLinkNode = new ContentItemLinkNode({ id: '7819dd59-1aa3-4c03-9d32-172c40167f77' });
        contentItemLinkNode.childNodes.push(new TextNode('content item link'));
        pWithLinks.childNodes.push(contentItemLinkNode);

        pWithLinks.childNodes.push(new TextNode(', an '));

        var emailLinkNode = new EmailLinkNode({ to: 'info@kentico.com', subject: 'Hi there!' });
        emailLinkNode.childNodes.push(new TextNode('e-mail link'));
        pWithLinks.childNodes.push(emailLinkNode);

        pWithLinks.childNodes.push(new TextNode(' and an '));

        var assetLinkNode = new AssetLinkNode({ id: '30a3a8c2-e9ab-47c2-84f4-e470985a3444' });
        assetLinkNode.childNodes.push(new TextNode('asset link'));
        pWithLinks.childNodes.push(assetLinkNode);

        pWithLinks.childNodes.push(new TextNode('.'));

        elements.push(pWithLinks);
        return elements;
    }

    static addListElements = (strictNested: boolean, nonStrictNested: boolean, trailingListItem: boolean): IContentElement[] => {
        const elements = [];
        
        // Ordered list
        const orderedList = new ListElement(ListTypes.Ordered);

        let listItem = new ListItemElement();
        listItem.childNodes.push(new TextNode('Ordered list item 1'));
        orderedList.items.push(listItem);

        listItem = new ListItemElement();
        listItem.childNodes.push(new TextNode('Ordered list item 2'));
        orderedList.items.push(listItem);

        elements.push(orderedList);

        // Unordered list
        const unorderedList = new ListElement(ListTypes.Unordered);

        listItem = new ListItemElement();
        listItem.childNodes.push(new TextNode('Unordered list item 1'));
        unorderedList.items.push(listItem);

        const unorderedListItem2 = new ListItemElement();
        unorderedListItem2.childNodes.push(new TextNode('Unordered list item 2'));
        unorderedList.items.push(unorderedListItem2);

        if (strictNested) {
            const strictNestedList = new ListElement(ListTypes.Unordered);
            unorderedListItem2.nestedList = strictNestedList;
            listItem = new ListItemElement();
            listItem.childNodes.push(new TextNode('Nested list item'));
            strictNestedList.items.push(listItem);
        }

        if (nonStrictNested) {
            var nonStrictNestedList = new ListElement(ListTypes.Unordered);
            unorderedList.items.push(nonStrictNestedList);
            listItem = new ListItemElement();
            listItem.childNodes.push(new TextNode('Nested list in non-strict mode'));
            nonStrictNestedList.items.push(listItem);

            if (trailingListItem) {
                listItem = new ListItemElement();
                listItem.childNodes.push(new TextNode('Trailing list item'));
                unorderedList.items.push(listItem);
            }
        }

        elements.push(unorderedList);
        return elements;
    }

    static getListsHtml = (strictNested: boolean, nonStrictNested: boolean, trailingListItem: boolean): string => {
        return `<ol>
  <li>Ordered list item 1</li>
  <li>
Ordered list item 2
</li>
</ol>

<ul>
  <li>Unordered list item 1</li>
  <li>Unordered list item 2${(strictNested ? `
    <ul>
      <li>Nested list item</li>
    </ul>
  ` : '')}</li>${(nonStrictNested ? `
  <ul>
    <li>Nested list in non-strict mode</li>
  </ul>` : '')}${(trailingListItem ? '<li>Trailing list item</li>' : '')}
</ul>`;
    }

    static createTableElement = (callback: () => IContentElement[]): TableElement => {
        const table = new TableElement();
        let row = new TableRowElement();
        let cell = new TableCellElement();

        let cellContent: IContentElementWithText = new ParagraphElement();
        cellContent.childNodes.push(new TextNode('Name'));
        cell.childElements.push(cellContent);
        row.cells.push(cell);
        cell = new TableCellElement();
        cellContent = new ParagraphElement();
        cellContent.childNodes.push(new TextNode('Surname'));
        cell.childElements.push(cellContent);
        row.cells.push(cell);
        table.rows.push(row);

        row = new TableRowElement();
        cell = new TableCellElement();
        cellContent = new ParagraphElement();
        cellContent.childNodes.push(new TextNode('A'));
        cell.childElements.push(cellContent);
        row.cells.push(cell);
        cell = new TableCellElement();
        cellContent = new ParagraphElement();
        cellContent.childNodes.push(new TextNode('B'));
        cell.childElements.push(cellContent);
        row.cells.push(cell);
        table.rows.push(row);

        row = new TableRowElement();
        cell = new TableCellElement();
        cellContent = new ParagraphElement();
        cellContent.childNodes.push(new TextNode('C'));
        cell.childElements.push(cellContent);
        row.cells.push(cell);

        cell = new TableCellElement();
        cell.childElements = callback();

        row.cells.push(cell);
        table.rows.push(row);

        return table;
    }
}