"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
var html_parser_1 = require("../html-parser");
var editor_state_1 = require("../editor-state");
var html_entities_1 = require("html-entities");
var content_1 = require("../content/");
var Parser = /** @class */ (function () {
    function Parser(strict) {
        var _this = this;
        this._headingTagNames = ['h1', 'h2', 'h3', 'h4'];
        this._listTagNames = ['ul', 'li'];
        this._objectTagNames = ['object', 'figure'];
        this._elementTagNames = this._headingTagNames
            .concat(this._listTagNames)
            .concat(this._objectTagNames)
            .concat(['p', 'table']);
        this._selfClosingTokenTypes = [html_parser_1.TokenType.OpeningTagSelfClosing, html_parser_1.TokenType.OpeningTagEnd];
        this._inlineStylesByTag = {
            strong: content_1.InlineStyle.Bold,
            em: content_1.InlineStyle.Italic,
            sub: content_1.InlineStyle.Subscript,
            sup: content_1.InlineStyle.Superscript,
            code: content_1.InlineStyle.Code
        };
        this._mutuallyExclusiveTags = ['sub', 'sup'];
        this._input = [];
        this._inputLength = 0;
        this._position = 0;
        this._contentComponents = null;
        this._usedComponents = [];
        this.parse = function (tokens, contentComponents) {
            if (contentComponents === void 0) { contentComponents = null; }
            _this._currentToken = null;
            _this._previousToken = null;
            _this._position = 0;
            _this._input = tokens;
            _this._inputLength = tokens.length;
            _this._contentComponents = contentComponents;
            _this.nextToken();
            var parsedDocument = _this.parseDocument();
            _this.validateDocumentForMutuallyExclusiveTags(_this._input);
            _this.validateAllContentComponentsAreUsed();
            return parsedDocument;
        };
        this.validateDocumentForMutuallyExclusiveTags = function (tokens) {
            var openedTags = [];
            var _loop_1 = function (token) {
                if (_this.isOpeningTagWhichHasMutuallyExclusiveTags(token)) {
                    exclusiveTagsForCurrentTag = _this._mutuallyExclusiveTags.filter(function (tag) { return tag != token.content; });
                    if (openedTags.some(function (tag) { return exclusiveTagsForCurrentTag.includes(tag); })) {
                        throw new Error("The tag <" + token.content + "> is mutually exclusive with the parent tag <" + openedTags.filter(function (tag) { return exclusiveTagsForCurrentTag.includes(tag); })[0] + ">. (" + token.line + ", " + token.column + ")");
                    }
                    if (token.content)
                        openedTags.push(token.content);
                }
                else if (_this.isClosingTagWhichHasMutuallyExclusiveTags(token)) {
                    openedTags.pop();
                }
            };
            var exclusiveTagsForCurrentTag;
            for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
                var token = tokens_1[_i];
                _loop_1(token);
            }
        };
        this.parseDocument = function () {
            var document = new content_1.RichTextContentModel();
            document.elements = _this.parseBlocks(document.elements);
            document.references = _this._modelHelper.references;
            return document;
        };
        this.parseBlocks = function (elements, parentBlockTypes) {
            while ((_this._currentToken) && (_this._currentToken.type != html_parser_1.TokenType.ClosingTag)) {
                var block = _this.acceptBlock(parentBlockTypes);
                if (block)
                    elements.push(block);
                _this.acceptWhiteSpaces();
            }
            return elements;
        };
        this.nextToken = function () {
            _this._previousToken = _this._currentToken;
            if (_this._position >= _this._inputLength) {
                _this._currentToken = null;
                return;
            }
            _this._currentToken = _this._input[_this._position];
            _this._position++;
        };
        this.acceptBlock = function (parentBlockTypes) {
            var _a, _b, _c, _d;
            _this.acceptWhiteSpaces();
            var block = (_c = (_b = (_a = _this.acceptParagraphBlock()) !== null && _a !== void 0 ? _a : _this.acceptHeadingBlock()) !== null && _b !== void 0 ? _b : _this.acceptListingBlock()) !== null && _c !== void 0 ? _c : _this.acceptFigureBlock();
            // Allow tables and objects (linked items, components) only at the root level
            if ((!parentBlockTypes) || (parentBlockTypes.length == 0)) {
                block = (_d = block !== null && block !== void 0 ? block : _this.acceptTableBlock()) !== null && _d !== void 0 ? _d : _this.acceptObjectBlock();
            }
            if (!block) {
                _this.throw("Expected an opening tag of one of the supported elements, but got " + _this.humanizeCurrentToken() + ".");
            }
            _this.acceptWhiteSpaces();
            return block;
        };
        this.isCurrent = function (tokenType, content) {
            var _a;
            var tokenContent = (_a = _this._currentToken) === null || _a === void 0 ? void 0 : _a.content;
            return _this._currentToken !== null &&
                _this._currentToken.type === tokenType &&
                (content === null || content === undefined || (tokenContent === null || tokenContent === void 0 ? void 0 : tokenContent.toLowerCase()) === (content === null || content === void 0 ? void 0 : content.toLowerCase()));
        };
        this.acceptHeadingBlock = function (level) {
            var _a, _b, _c;
            if (level) {
                var tag = _this._headingTagNames[level - 1];
                if (_this.acceptOpeningTag(tag)) {
                    var block = new content_1.HeadingElement(level);
                    _this.parseLine(block.childNodes);
                    _this.expectClosingTag(tag);
                    return block;
                }
                return null;
            }
            return (_c = (_b = (_a = _this.acceptHeadingBlock(1)) !== null && _a !== void 0 ? _a : _this.acceptHeadingBlock(2)) !== null && _b !== void 0 ? _b : _this.acceptHeadingBlock(3)) !== null && _c !== void 0 ? _c : _this.acceptHeadingBlock(4);
        };
        this.acceptParagraphBlock = function () {
            if (_this.acceptOpeningTag('p')) {
                var block = new content_1.ParagraphElement();
                block.childNodes = _this.parseLine(block.childNodes);
                _this.expectClosingTag('p');
                return block;
            }
            return null;
        };
        this.acceptOpeningTag = function (tagName) {
            if (_this.acceptOpeningTagStart(tagName)) {
                _this.expectElementToken(html_parser_1.TokenType.OpeningTagEnd);
                return true;
            }
            return false;
        };
        this.acceptWhiteSpaces = function () {
            var _a, _b;
            var capturedWhiteSpaces = '';
            while (_this.isCurrent(html_parser_1.TokenType.PlainText) && html_parser_1.isNullOrWhitespace((_a = _this._currentToken) === null || _a === void 0 ? void 0 : _a.content)) {
                capturedWhiteSpaces += (_b = _this._currentToken) === null || _b === void 0 ? void 0 : _b.content;
                _this.nextToken();
            }
            return capturedWhiteSpaces;
        };
        this.parseLine = function (container) {
            container = _this.parseText(container);
            container = _this.normalizeWhitespace(container);
            return container;
        };
        this.throw = function (message) {
            var _a, _b;
            var token = (_b = (_a = _this._previousToken) !== null && _a !== void 0 ? _a : _this._currentToken) !== null && _b !== void 0 ? _b : html_parser_1.Token.empty;
            throw new Error(message + " (" + token.line + ", " + token.column + ")");
        };
        this.validateAllContentComponentsAreUsed = function () {
            var _a;
            var componentIds = _this._contentComponents && ((_a = _this._contentComponents) === null || _a === void 0 ? void 0 : _a.map(function (c) { return c.id; }).sort().join(','));
            if (!componentIds || _this._usedComponents.sort().join(',') === componentIds) {
                return;
            }
            _this.throw('There are unused components in the components array. Remove all unused components or use them in the rich text.');
        };
        this.isOpeningTagWhichHasMutuallyExclusiveTags = function (token) {
            if (token.type == html_parser_1.TokenType.OpeningTagBeginning && token.content) {
                return _this._mutuallyExclusiveTags.includes(token.content);
            }
            else
                return false;
        };
        this.isClosingTagWhichHasMutuallyExclusiveTags = function (token) {
            if (token.type == html_parser_1.TokenType.ClosingTag && token.content) {
                return _this._mutuallyExclusiveTags.includes(token.content);
            }
            else
                return false;
        };
        this.parseNestedContent = function (elements, parentBlockTypes) {
            _this.acceptWhiteSpaces();
            var containsRichText = _this._elementTagNames.some(function (tagName) { return _this.isCurrent(html_parser_1.TokenType.OpeningTagBeginning, tagName); });
            if (containsRichText) {
                _this.parseBlocks(elements, parentBlockTypes);
            }
            else {
                // If there is no wrapping element tag, parse the context as text and place it into a single paragraph (unstyled) block
                var block = new content_1.ParagraphElement();
                _this.parseLine(block.childNodes);
                elements.push(block);
            }
        };
        this.acceptFigureBlock = function () {
            if (_this.acceptOpeningTagStart('figure')) {
                var attributes = _this.parseAttributes();
                _this.acceptWhiteSpaces();
                var image = _this.parseImage();
                _this.acceptWhiteSpaces();
                _this.expectClosingTag('figure');
                return _this._modelHelper.createImageElement(attributes, image, _this._previousToken);
            }
            return null;
        };
        this.parseImage = function () {
            if (_this.acceptOpeningTagStart('img')) {
                var attributes = _this.parseAttributes();
                return new html_parser_1.Image(attributes);
            }
            return null;
        };
        this.acceptObjectBlock = function () {
            if (_this.acceptOpeningTagStart('object')) {
                var attributes = _this.parseAttributes();
                _this.acceptWhiteSpaces();
                _this.expectClosingTag('object');
                var element = _this._modelHelper.createObjectElement(attributes, _this._previousToken, _this._contentComponents);
                if (element instanceof content_1.ContentComponentElement) {
                    if (_this._usedComponents.includes(element.id)) {
                        _this.throw("A component with 'id=" + element.id + "' is referenced multiple times. Remove the duplicity so that the component is referenced only once.");
                    }
                    _this._usedComponents.push(element.id);
                }
                return element;
            }
            return null;
        };
        this.acceptListingBlock = function () {
            if (_this.acceptOpeningTag('ul')) {
                var listing = new content_1.ListElement(content_1.ListTypes.Unordered);
                _this.parseListingItems(listing.items, listing);
                _this.expectClosingTag('ul');
                return listing;
            }
            if (_this.acceptOpeningTag('ol')) {
                var listing = new content_1.ListElement(content_1.ListTypes.Ordered);
                _this.parseListingItems(listing.items, listing);
                _this.expectClosingTag('ol');
                return listing;
            }
            return null;
        };
        this.parseListingItems = function (listingItems, context) {
            var item;
            var nestedList;
            do {
                item = null;
                _this.acceptWhiteSpaces();
                if (_this.acceptOpeningTag('li')) {
                    item = new content_1.ListItemElement();
                    listingItems.push(item);
                    _this.parseListingItemContent(item);
                    _this.expectClosingTag('li');
                }
                nestedList = _this.acceptListingBlock();
                if (nestedList) {
                    if (_this.strict) {
                        _this.throw('Nested list must be placed inside a list item in strict mode.');
                    }
                    context.items.push(nestedList);
                }
            } while (item || nestedList);
            _this.acceptWhiteSpaces();
        };
        this.parseListingItemContent = function (itemElement) {
            _this.parseLine(itemElement.childNodes);
            var nestedList = _this.acceptListingBlock();
            if (nestedList) {
                itemElement.nestedList = nestedList;
                _this.acceptWhiteSpaces();
            }
        };
        this.acceptTableBlock = function () {
            if (_this.acceptOpeningTag('table')) {
                _this.acceptWhiteSpaces();
                _this.expectElementToken(html_parser_1.TokenType.OpeningTagBeginning, 'tbody');
                _this.expectElementToken(html_parser_1.TokenType.OpeningTagEnd);
                _this.acceptWhiteSpaces();
                var table = new content_1.TableElement();
                _this.parseTableRows(table.rows);
                _this.expectClosingTag('tbody');
                _this.acceptWhiteSpaces();
                _this.expectClosingTag('table');
                return table;
            }
            return null;
        };
        this.parseTableRows = function (rows) {
            while (_this.acceptOpeningTag('tr')) {
                _this.acceptWhiteSpaces();
                var row = new content_1.TableRowElement();
                _this.parseTableCells(row.cells);
                _this.acceptWhiteSpaces();
                _this.expectClosingTag('tr');
                _this.acceptWhiteSpaces();
                rows.push(row);
            }
        };
        this.parseTableCells = function (cells) {
            while (_this.acceptOpeningTag('td')) {
                var cell = new content_1.TableCellElement();
                _this.parseNestedContent(cell.childElements, [editor_state_1.EditorStateConstants.BlockTypes.tableCell]);
                _this.expectClosingTag('td');
                _this.acceptWhiteSpaces();
                cells.push(cell);
            }
        };
        this.acceptLink = function () {
            var link = null;
            if (_this.acceptOpeningTagStart('a')) {
                var attributes = _this.parseAttributes();
                link = _this._modelHelper.createLink(attributes, _this._previousToken);
                if (link)
                    _this.parseLinkContent(link.childNodes);
                _this.expectClosingTag("a");
            }
            return link;
        };
        this.parseLinkContent = function (container) {
            var _a, _b;
            var content;
            do {
                content = (_b = (_a = _this.acceptPlainText()) !== null && _a !== void 0 ? _a : _this.acceptStyledContent()) !== null && _b !== void 0 ? _b : _this.acceptLineBreak();
                if (content)
                    container.push(content);
            } while (content);
        };
        this.parseAttributes = function () {
            var attributes = {};
            var name;
            var value;
            while (name = _this.acceptAttributeName()) {
                if (Object.keys(attributes).includes(name))
                    _this.throw("Expected unique element attributes, but got a duplicated '" + name.toLowerCase() + "' attribute.");
                value = _this.acceptAttributeValue();
                attributes[name] = value;
            }
            _this.expectElementToken(html_parser_1.TokenType.OpeningTagEnd);
            return attributes;
        };
        this.acceptAttributeName = function () {
            var _a;
            var content = (_a = _this._currentToken) === null || _a === void 0 ? void 0 : _a.content;
            if (content && _this.accept(html_parser_1.TokenType.AttributeName)) {
                return content;
            }
            else {
                return null;
            }
        };
        this.acceptAttributeValue = function () {
            var _a;
            var value = '';
            var content = (_a = _this._currentToken) === null || _a === void 0 ? void 0 : _a.content;
            if (_this.accept(html_parser_1.TokenType.AttributeValue)) {
                value = html_entities_1.decode(content);
            }
            return value;
        };
        this.parseText = function (container) {
            var _a, _b, _c;
            var content;
            do {
                content = (_c = (_b = (_a = _this.acceptPlainText()) !== null && _a !== void 0 ? _a : _this.acceptStyledContent()) !== null && _b !== void 0 ? _b : _this.acceptLineBreak()) !== null && _c !== void 0 ? _c : _this.acceptLink();
                if (content) {
                    container.push(content);
                }
            } while (content);
            return container;
        };
        this.acceptPlainText = function () {
            if (!_this._currentToken) {
                return null;
            }
            var text = _this._currentToken.content;
            return _this.accept(html_parser_1.TokenType.PlainText)
                ? _this._modelHelper.createTextNode(text)
                : null;
        };
        this.acceptStyledContent = function () {
            var block = null;
            for (var inlineStyleKey in _this._inlineStylesByTag) {
                if (!_this.acceptOpeningTag(inlineStyleKey)) {
                    continue;
                }
                block = new content_1.InlineStyleNode(_this._inlineStylesByTag[inlineStyleKey]);
                _this.parseText(block.childNodes);
                _this.expectClosingTag(inlineStyleKey);
                break;
            }
            return block;
        };
        this.acceptLineBreak = function () {
            if (_this.acceptOpeningTagStart('br')) {
                _this.expectOneOfElementTokens(_this._selfClosingTokenTypes);
                return new content_1.LineBreakNode();
            }
            return null;
        };
        this.accept = function (tokenType, content) {
            if (_this.isCurrent(tokenType, content)) {
                _this.nextToken();
                return true;
            }
            return false;
        };
        this.expectElementToken = function (tokenType, elementName) {
            if (_this.accept(tokenType, elementName)) {
                return;
            }
            var tokenDescription = _this.humanizeElementToken(tokenType, elementName);
            var currentTokenDescription = _this.humanizeCurrentToken();
            _this.throw("Expected " + tokenDescription + ", but got " + currentTokenDescription + ".");
        };
        this.expectOneOfElementTokens = function (tokenTypes, elementName) {
            if (tokenTypes.some(function (tokenType) { return _this.accept(tokenType, elementName); })) {
                return;
            }
            var tokenDescription = _this.humanizeElementTokens(tokenTypes, elementName);
            var currentTokenDescription = _this.humanizeCurrentToken();
            _this.throw("Expected " + tokenDescription + ", but got " + currentTokenDescription + ".");
        };
        this.humanizeElementTokens = function (tokenTypes, elementName) {
            var humanized = tokenTypes.map(function (tokenType) { return _this.humanizeElementToken(tokenType, elementName); });
            return humanized.join(' or ');
        };
        this.humanizeElementToken = function (tokenType, elementName) {
            if (elementName) {
                elementName = elementName.toLocaleUpperCase();
                switch (tokenType) {
                    case html_parser_1.TokenType.ClosingTag: return "a closing tag of the " + elementName + " element";
                    case html_parser_1.TokenType.OpeningTagBeginning: return "an opening tag of the " + elementName + " element";
                    case html_parser_1.TokenType.OpeningTagEnd: return "the end of the opening tag of the " + elementName + " element";
                    case html_parser_1.TokenType.OpeningTagSelfClosing: return "the end of the self-closing tag of the " + elementName + " element";
                }
            }
            else {
                switch (tokenType) {
                    case html_parser_1.TokenType.ClosingTag: return 'a closing tag';
                    case html_parser_1.TokenType.OpeningTagBeginning: return 'an opening tag';
                    case html_parser_1.TokenType.OpeningTagEnd: return 'the end of the opening tag';
                    case html_parser_1.TokenType.OpeningTagSelfClosing: return 'the end of the self-closing tag';
                }
            }
            _this.throw("Invalid token type: " + tokenType);
            return '';
        };
        this.humanizeCurrentToken = function () {
            if (!_this._currentToken) {
                return 'the end of the rich text value';
            }
            switch (_this._currentToken.type) {
                case html_parser_1.TokenType.AttributeName: return 'an attribute name';
                case html_parser_1.TokenType.AttributeValue: return 'an attribute value';
                case html_parser_1.TokenType.ClosingTag: return "a closing tag " + _this._currentToken.content;
                case html_parser_1.TokenType.OpeningTagBeginning: return "an opening tag " + _this._currentToken.content;
                case html_parser_1.TokenType.OpeningTagEnd: return "the end of an opening tag " + _this._currentToken.content;
                case html_parser_1.TokenType.OpeningTagSelfClosing: return "the end of the self-closing tag " + _this._currentToken.content;
                case html_parser_1.TokenType.PlainText: return "a text " + _this._currentToken.content;
                default: _this.throw("Invalid token type: " + _this._currentToken.type);
            }
        };
        this.acceptOpeningTagStart = function (tagName) {
            return _this.accept(html_parser_1.TokenType.OpeningTagBeginning, tagName);
        };
        this.expectClosingTag = function (tagName) {
            _this.expectElementToken(html_parser_1.TokenType.ClosingTag, tagName);
        };
        this.normalizeWhitespace = function (nodes, context) {
            var _a;
            if (!context)
                context = new html_parser_1.NormalizeContext(null, false, false);
            var whitespace = ['\t', '\n', '\f', '\r', ' '];
            for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                var node = nodes_1[_i];
                if (node instanceof content_1.TextNode) {
                    var textStartsWithWhitespace = whitespace.includes(node.textContent[0]);
                    var textEndsWithWhitespace = whitespace.includes(node.textContent[node.textContent.length - 1]);
                    node.textContent = node.textContent.trim();
                    if (node.textContent.length > 0) {
                        if (context.hasContent && context.hasTrailingWhitespace) {
                            context.setLastText(((_a = context.lastTextNode) === null || _a === void 0 ? void 0 : _a.textContent) + ' ');
                        }
                        if (textStartsWithWhitespace && context.hasContent && !context.hasTrailingWhitespace) {
                            node.textContent = ' ' + node.textContent;
                        }
                        context.hasContent = true;
                    }
                    context.lastTextNode = node;
                    context.hasTrailingWhitespace = textEndsWithWhitespace;
                }
                else if (node instanceof content_1.LineBreakNode) {
                    context.hasContent = false;
                    context.hasTrailingWhitespace = false;
                }
                else {
                    // TODO
                    _this.normalizeWhitespace(node.childNodes, context);
                }
            }
            return nodes;
        };
        this.strict = strict;
        this._currentToken = null;
        this._previousToken = null;
        this._modelHelper = new html_parser_1.ModelHelper();
    }
    return Parser;
}());
exports.Parser = Parser;
