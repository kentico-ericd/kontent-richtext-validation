import { Token, TokenType, ModelHelper, isNullOrWhitespace, Image, NormalizeContext } from '../html-parser';
import { EditorStateConstants } from '../editor-state';
import { decode } from 'html-entities';
import {
    TableElement,
    TableCellElement,
    TableRowElement,
    ListItemElement,
    IListItemElement,
    ListTypes,
    ListElement,
    IContentNode,
    InlineStyle,
    EntityNode,
    ContentComponentElement,
    RichTextContentModel,
    IContentElement,
    ParagraphElement,
    InlineStyleNode,
    LineBreakNode,
    TextNode,
    HeadingElement
} from '../content/';

export class Parser {
    private _headingTagNames: string[] = ['h1', 'h2', 'h3', 'h4'];
    private _listTagNames: string[] = ['ul', 'li'];
    private _objectTagNames: string[] = ['object', 'figure'];
    private _elementTagNames: string[] = this._headingTagNames
        .concat(this._listTagNames)
        .concat(this._objectTagNames)
        .concat(['p', 'table']);
    private _selfClosingTokenTypes: TokenType[] = [TokenType.OpeningTagSelfClosing, TokenType.OpeningTagEnd];
    private _inlineStylesByTag: Record<string, InlineStyle> = {
        strong: InlineStyle.Bold,
        em: InlineStyle.Italic,
        sub: InlineStyle.Subscript,
        sup: InlineStyle.Superscript,
        code: InlineStyle.Code
    };
    private _mutuallyExclusiveTags: string[] = ['sub', 'sup'];

    private _input: Token[] = [];
    private _inputLength: number = 0;
    private _position: number = 0;
    private _currentToken: Token | null;
    private _previousToken: Token | null;
    private _modelHelper: ModelHelper;
    private _contentComponents: ContentComponentElement[] | null = null;
    private _usedComponents: string[] = [];

    strict: boolean;

    constructor(strict: boolean) {
        this.strict = strict;
        this._currentToken = null;
        this._previousToken = null;
        this._modelHelper = new ModelHelper();
    }

    parse = (tokens: Token[], contentComponents: ContentComponentElement[] | null = null): RichTextContentModel => {
        this._currentToken = null;
        this._previousToken = null;
        this._position = 0;
        this._input = tokens;
        this._inputLength = tokens.length;
        this._contentComponents = contentComponents;

        this.nextToken();
        const parsedDocument = this.parseDocument();

        this.validateDocumentForMutuallyExclusiveTags(this._input);

        this.validateAllContentComponentsAreUsed();

        return parsedDocument;
    }

    private validateDocumentForMutuallyExclusiveTags = (tokens: Token[]) => {
        const openedTags: string[] = [];

        for (const token of tokens) {
            if (this.isOpeningTagWhichHasMutuallyExclusiveTags(token)) {
                var exclusiveTagsForCurrentTag = this._mutuallyExclusiveTags.filter(tag => tag != token.content);

                if (openedTags.some(tag => exclusiveTagsForCurrentTag.includes(tag))) {
                    throw new Error(`The tag <${token.content}> is mutually exclusive with the parent tag <${openedTags.filter(tag => exclusiveTagsForCurrentTag.includes(tag))[0]}>. (${token.line}, ${token.column})`);
                }

                if(token.content) openedTags.push(token.content);
            }
            else if (this.isClosingTagWhichHasMutuallyExclusiveTags(token)) {
                openedTags.pop();
            }
        }
    }

    private parseDocument = (): RichTextContentModel => {
        let document = new RichTextContentModel();

        document.elements = this.parseBlocks(document.elements);
        document.references = this._modelHelper.references;

        return document;
    }

    private parseBlocks = (elements: IContentElement[], parentBlockTypes?: string[]): IContentElement[] => {
        while ((this._currentToken) && (this._currentToken.type != TokenType.ClosingTag)) {
            const block = this.acceptBlock(parentBlockTypes);
            if (block) elements.push(block);
            this.acceptWhiteSpaces();
        }

        return elements;
    }

    private nextToken = () => {
        this._previousToken = this._currentToken;

        if (this._position >= this._inputLength) {
            this._currentToken = null;
            return;
        }

        this._currentToken = this._input[this._position];
        this._position++;
    }

    private acceptBlock = (parentBlockTypes?: string[]): IContentElement | null => {
        this.acceptWhiteSpaces();

        let block =
            this.acceptParagraphBlock() ??
            this.acceptHeadingBlock() ??
            this.acceptListingBlock() ??
            this.acceptFigureBlock();

        // Allow tables and objects (linked items, components) only at the root level
        if ((!parentBlockTypes) || (parentBlockTypes.length == 0)) {
            block =
                block ??
                this.acceptTableBlock() ??
                this.acceptObjectBlock();
        }

        if (!block) {
            this.throw(`Expected an opening tag of one of the supported elements, but got ${this.humanizeCurrentToken()}.`);
        }

        this.acceptWhiteSpaces();

        return block;
    }

    private isCurrent = (tokenType: TokenType, content?: string): boolean => {
        const tokenContent = this._currentToken?.content;
        return this._currentToken !== null &&
            this._currentToken.type === tokenType &&
            (content === null || content === undefined || tokenContent?.toLowerCase() === content?.toLowerCase());
    }

    private acceptHeadingBlock = (level?: number): IContentElement | null => {
        if (level) {
            let tag = this._headingTagNames[level - 1];
            if (this.acceptOpeningTag(tag)) {
                var block = new HeadingElement(level);
                this.parseLine(block.childNodes);
                this.expectClosingTag(tag);

                return block;
            }

            return null;
        }

        return this.acceptHeadingBlock(1) ??
            this.acceptHeadingBlock(2) ??
            this.acceptHeadingBlock(3) ??
            this.acceptHeadingBlock(4);
    }

    private acceptParagraphBlock = (): IContentElement | null => {
        if (this.acceptOpeningTag('p')) {
            let block = new ParagraphElement();
            block.childNodes = this.parseLine(block.childNodes);
            this.expectClosingTag('p');

            return block;
        }

        return null;
    }

    private acceptOpeningTag = (tagName: string): boolean => {
        if (this.acceptOpeningTagStart(tagName)) {
            this.expectElementToken(TokenType.OpeningTagEnd);

            return true;
        }

        return false;
    }

    private acceptWhiteSpaces = (): string => {
        let capturedWhiteSpaces = '';

        while (this.isCurrent(TokenType.PlainText) && isNullOrWhitespace(this._currentToken?.content)) {
            capturedWhiteSpaces += this._currentToken?.content;
            this.nextToken();
        }

        return capturedWhiteSpaces;
    }

    private parseLine = (container: IContentNode[]): IContentNode[] => {
        container = this.parseText(container);
        container = this.normalizeWhitespace(container);

        return container;
    }

    private throw = (message: string) => {
        const token = this._previousToken ?? this._currentToken ?? Token.empty;
        throw new Error(`${message} (${token.line}, ${token.column})`);
    }

    private validateAllContentComponentsAreUsed = () => {
        const componentIds = this._contentComponents && this._contentComponents?.map(c => c.id).sort().join(',');
        if (!componentIds || this._usedComponents.sort().join(',') === componentIds) {
            return;
        }

        this.throw('There are unused components in the components array. Remove all unused components or use them in the rich text.');
    }

    private isOpeningTagWhichHasMutuallyExclusiveTags = (token: Token): boolean => {
        if(token.type == TokenType.OpeningTagBeginning && token.content) {
            return this._mutuallyExclusiveTags.includes(token.content);
        }
        else return false;
    }

    private isClosingTagWhichHasMutuallyExclusiveTags = (token: Token): boolean => {
        if(token.type == TokenType.ClosingTag && token.content) {
            return this._mutuallyExclusiveTags.includes(token.content);
        }
        else return false;
    }

    private parseNestedContent = (elements: IContentElement[], parentBlockTypes: string[]) => {
        this.acceptWhiteSpaces();

        var containsRichText = this._elementTagNames.some(tagName => this.isCurrent(TokenType.OpeningTagBeginning, tagName));
        if (containsRichText) {
            this.parseBlocks(elements, parentBlockTypes);
        }
        else {
            // If there is no wrapping element tag, parse the context as text and place it into a single paragraph (unstyled) block
            var block = new ParagraphElement();
            this.parseLine(block.childNodes);
            elements.push(block);
        }
    }

    private acceptFigureBlock = (): IContentElement | null => {
        if (this.acceptOpeningTagStart('figure')) {
            const attributes = this.parseAttributes();

            this.acceptWhiteSpaces();
            const image = this.parseImage();
            this.acceptWhiteSpaces();

            this.expectClosingTag('figure');

            return this._modelHelper.createImageElement(attributes, image, this._previousToken);
        }

        return null;
    }

    private parseImage = (): Image | null => {
        if (this.acceptOpeningTagStart('img')) {
            const attributes = this.parseAttributes();

            return new Image(attributes);
        }

        return null;
    }

    private acceptObjectBlock = (): IContentElement | null => {
        if (this.acceptOpeningTagStart('object')) {
            const attributes = this.parseAttributes();
            this.acceptWhiteSpaces();
            this.expectClosingTag('object');

            var element = this._modelHelper.createObjectElement(attributes, this._previousToken, this._contentComponents);
            if (element instanceof ContentComponentElement) {
                if (this._usedComponents.includes(element.id)) {
                    this.throw(`A component with 'id=${element.id}' is referenced multiple times. Remove the duplicity so that the component is referenced only once.`);
                }
                this._usedComponents.push(element.id);
            }

            return element;
        }

        return null;
    }

    private acceptListingBlock = (): ListElement | null => {
        if (this.acceptOpeningTag('ul')) {
            const listing = new ListElement(ListTypes.Unordered);
            this.parseListingItems(listing.items, listing);
            this.expectClosingTag('ul');
            return listing;
        }

        if (this.acceptOpeningTag('ol')) {
            const listing = new ListElement(ListTypes.Ordered);
            this.parseListingItems(listing.items, listing);
            this.expectClosingTag('ol');
            return listing;
        }

        return null;
    }

    private parseListingItems = (listingItems: IListItemElement[], context: ListElement) => {
        let item: ListItemElement | null;
        let nestedList: ListElement | null;
        do {
            item = null;

            this.acceptWhiteSpaces();
            if (this.acceptOpeningTag('li')) {
                item = new ListItemElement();
                listingItems.push(item);
                this.parseListingItemContent(item);
                this.expectClosingTag('li');
            }

            nestedList = this.acceptListingBlock();
            if (nestedList) {
                if (this.strict) {
                    this.throw('Nested list must be placed inside a list item in strict mode.');
                }

                context.items.push(nestedList);
            }
        } while (item || nestedList);

        this.acceptWhiteSpaces();
    }

    private parseListingItemContent = (itemElement: ListItemElement) => {
        this.parseLine(itemElement.childNodes);

        const nestedList: ListElement | null = this.acceptListingBlock();
        if (nestedList) {
            itemElement.nestedList = nestedList;
            this.acceptWhiteSpaces();
        }
    }

    private acceptTableBlock = (): IContentElement | null => {
        if (this.acceptOpeningTag('table')) {
            this.acceptWhiteSpaces();
            this.expectElementToken(TokenType.OpeningTagBeginning, 'tbody');
            this.expectElementToken(TokenType.OpeningTagEnd);
            this.acceptWhiteSpaces();

            let table = new TableElement();
            this.parseTableRows(table.rows);

            this.expectClosingTag('tbody');
            this.acceptWhiteSpaces();
            this.expectClosingTag('table');
            return table;
        }

        return null;
    }

    private parseTableRows = (rows: TableRowElement[]) => {
        while (this.acceptOpeningTag('tr')) {
            this.acceptWhiteSpaces();
            let row = new TableRowElement();

            this.parseTableCells(row.cells);
            this.acceptWhiteSpaces();
            this.expectClosingTag('tr');
            this.acceptWhiteSpaces();
            rows.push(row);
        }
    }

    private parseTableCells = (cells: TableCellElement[]) => {
        while (this.acceptOpeningTag('td')) {
            let cell = new TableCellElement();
            this.parseNestedContent(cell.childElements, [EditorStateConstants.BlockTypes.tableCell]);

            this.expectClosingTag('td');
            this.acceptWhiteSpaces();
            cells.push(cell);
        }
    }

    private acceptLink = (): EntityNode | null => {
        let link: EntityNode | null = null;

        if (this.acceptOpeningTagStart('a')) {
            const attributes = this.parseAttributes();
            link = this._modelHelper.createLink(attributes, this._previousToken);
            if (link) this.parseLinkContent(link.childNodes);
            this.expectClosingTag('a');
        }

        return link;
    }

    private parseLinkContent = (container: IContentNode[]) => {
        let content: IContentNode | null;
        do {
            content =
                this.acceptPlainText() ??
                this.acceptStyledContent() ??
                this.acceptLineBreak();

            if (content)
                container.push(content);

        } while (content);
    }

    private parseAttributes = (): Record<string, string> => {
        const attributes: Record<string, string> = {};
        let name: string | null;
        let value: string;

        while (name = this.acceptAttributeName()) {
            if (Object.keys(attributes).includes(name))
                this.throw(`Expected unique element attributes, but got a duplicated '${name.toLowerCase()}' attribute.`);

            value = this.acceptAttributeValue();
            attributes[name] = value;
        }

        this.expectElementToken(TokenType.OpeningTagEnd);

        return attributes;
    }

    private acceptAttributeName = (): string | null => {
        const content: string | undefined | null = this._currentToken?.content;
        if (content && this.accept(TokenType.AttributeName)) {
            return content;
        }
        else {
            return null;
        }
    }

    private acceptAttributeValue = (): string => {
        let value: string = '';
        let content = this._currentToken?.content;
        if (this.accept(TokenType.AttributeValue)) {
            value = decode(content);
        }

        return value;
    }

    private parseText = (container: IContentNode[]): IContentNode[] => {
        let content: IContentNode | null;
        do {
            content =
                this.acceptPlainText() ??
                this.acceptStyledContent() ??
                this.acceptLineBreak() ??
                this.acceptLink();

            if (content) {
                container.push(content);
            }

        } while (content);

        return container;
    }

    private acceptPlainText = (): IContentNode | null => {
        if (!this._currentToken) {
            return null;
        }

        let text = this._currentToken.content;

        return this.accept(TokenType.PlainText)
            ? this._modelHelper.createTextNode(text)
            : null;
    }

    private acceptStyledContent = (): IContentNode | null=> {
        let block: InlineStyleNode | null = null;

        for (const inlineStyleKey in this._inlineStylesByTag) {
            if (!this.acceptOpeningTag(inlineStyleKey)) {
                continue;
            }

            block = new InlineStyleNode(this._inlineStylesByTag[inlineStyleKey]);
            this.parseText(block.childNodes);
            this.expectClosingTag(inlineStyleKey);

            break;
        }

        return block;
    }

    private acceptLineBreak = (): IContentNode | null => {
        if (this.acceptOpeningTagStart('br')) {
            this.expectOneOfElementTokens(this._selfClosingTokenTypes);

            return new LineBreakNode();
        }

        return null;
    }

    private accept = (tokenType: TokenType, content?: string): boolean => {
        if (this.isCurrent(tokenType, content)) {
            this.nextToken();
            return true;
        }

        return false;
    }

    private expectElementToken = (tokenType: TokenType, elementName?: string) => {
        if (this.accept(tokenType, elementName)) {
            return;
        }

        const tokenDescription = this.humanizeElementToken(tokenType, elementName);
        const currentTokenDescription = this.humanizeCurrentToken();

        this.throw(`Expected ${tokenDescription}, but got ${currentTokenDescription}.`);
    }

    private expectOneOfElementTokens = (tokenTypes: TokenType[], elementName?: string) => {
        if (tokenTypes.some(tokenType => this.accept(tokenType, elementName))) {
            return;
        }

        const tokenDescription = this.humanizeElementTokens(tokenTypes, elementName);
        const currentTokenDescription = this.humanizeCurrentToken();

        this.throw(`Expected ${tokenDescription}, but got ${currentTokenDescription}.`);
    }

    private humanizeElementTokens = (tokenTypes: TokenType[], elementName?: string): string => {
        const humanized = tokenTypes.map(tokenType => this.humanizeElementToken(tokenType, elementName));

        return humanized.join(' or ');
    }

    private humanizeElementToken = (tokenType: TokenType, elementName?: string): string => {
        if (elementName) {
            elementName = elementName.toLocaleUpperCase();

            switch (tokenType) {
                case TokenType.ClosingTag: return `a closing tag of the ${elementName} element`;
                case TokenType.OpeningTagBeginning: return `an opening tag of the ${elementName} element`;
                case TokenType.OpeningTagEnd: return `the end of the opening tag of the ${elementName} element`;
                case TokenType.OpeningTagSelfClosing: return `the end of the self-closing tag of the ${elementName} element`;
            }
        }
        else {
            switch (tokenType) {
                case TokenType.ClosingTag: return 'a closing tag';
                case TokenType.OpeningTagBeginning: return 'an opening tag';
                case TokenType.OpeningTagEnd: return 'the end of the opening tag';
                case TokenType.OpeningTagSelfClosing: return 'the end of the self-closing tag';
            }
        }

        this.throw(`Invalid token type: ${tokenType}`);
        return '';
    }

    private humanizeCurrentToken = (): string | undefined => {
        if (!this._currentToken) {
            return 'the end of the rich text value';
        }

        switch (this._currentToken.type) {
            case TokenType.AttributeName: return 'an attribute name';
            case TokenType.AttributeValue: return 'an attribute value';
            case TokenType.ClosingTag: return `a closing tag ${this._currentToken.content}`;
            case TokenType.OpeningTagBeginning: return `an opening tag ${this._currentToken.content}`;
            case TokenType.OpeningTagEnd: return `the end of an opening tag ${this._currentToken.content}`;
            case TokenType.OpeningTagSelfClosing: return `the end of the self-closing tag ${this._currentToken.content}`;
            case TokenType.PlainText: return `a text ${this._currentToken.content}`;
            default: this.throw(`Invalid token type: ${this._currentToken.type}`);
        }
    }

    private acceptOpeningTagStart = (tagName: string): boolean => {
        return this.accept(TokenType.OpeningTagBeginning, tagName);
    }

    private expectClosingTag = (tagName: string) => {
        this.expectElementToken(TokenType.ClosingTag, tagName);
    }

    private normalizeWhitespace = (nodes: IContentNode[], context?: NormalizeContext): IContentNode[] => {
        if (!context) context = new NormalizeContext(null, false, false);
        const whitespace = ['\t', '\n', '\f', '\r', ' '];

        for (const node of nodes) {
            if (node instanceof TextNode) {
                const textStartsWithWhitespace = whitespace.includes(node.textContent[0]);
                const textEndsWithWhitespace = whitespace.includes(node.textContent[node.textContent.length - 1]);
                node.textContent = node.textContent.trim();

                if (node.textContent.length > 0) {
                    if (context.hasContent && context.hasTrailingWhitespace) {
                        context.setLastText(context.lastTextNode?.textContent + ' ');
                    }

                    if (textStartsWithWhitespace && context.hasContent && !context.hasTrailingWhitespace) {
                        node.textContent = ' ' + node.textContent;
                    }

                    context.hasContent = true;
                }

                context.lastTextNode = node;
                context.hasTrailingWhitespace = textEndsWithWhitespace;
            }
            else if (node instanceof LineBreakNode) {
                context.hasContent = false;
                context.hasTrailingWhitespace = false;
            }
            else {
                this.normalizeWhitespace(node.childNodes, context);
            }
        }

        return nodes;
    }
}
