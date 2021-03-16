"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelHelper = void 0;
var html_parser_1 = require("../html-parser");
var html_entities_1 = require("html-entities");
var content_1 = require("../content");
var ModelHelper = /** @class */ (function () {
    function ModelHelper() {
        var _this = this;
        this.references = [];
        this._whitespace = ['\t', '\n', '\f', '\r', ' '];
        this._linkAttributes = [
            'href',
            'data-item-id',
            'data-item-external-id',
            'data-asset-id',
            'data-asset-external-id',
            'data-email-address'
        ];
        this._emptyGuid = '00000000-0000-0000-0000-000000000000';
        // Required when resolving URL links
        this._unsafeProtocols = ['javascript:', 'data:', 'vbscript:'];
        this._guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        this._whitespaceRegex = /[^\w:]+/gm;
        this._protocolRegex = new RegExp('^(([A-Z]+://.+)|\\?|#|/)', 'i');
        this.createTextNode = function (text) {
            return new content_1.TextNode(html_entities_1.decode(_this.normalizeWhiteSpaces(text)));
        };
        this.normalizeWhiteSpaces = function (text) {
            var index = 0;
            var src = text;
            var skip = false;
            for (var i = 0; i < text.length; i++) {
                var ch = text[i];
                if (_this._whitespace.includes(ch)) {
                    if (skip)
                        continue;
                    src = _this.setCharAt(src, index++, ' ');
                    skip = true;
                }
                else {
                    src = _this.setCharAt(src, index++, ch);
                    skip = false;
                }
            }
            return src.slice(0, index);
        };
        this.setCharAt = function (str, index, chr) {
            if (index > str.length - 1)
                return str;
            return str.substring(0, index) + chr + str.substring(index + 1);
        };
        this.createLink = function (attributes, context) {
            // <p>Text with a <a href="http://www.kentico.com">URL link</a>,
            // a <a href="http://www.kentico.com" data-new-window="true">URL link that opens in a new window</a>,
            // a <a data-item-id="7819dd59-1aa3-4c03-9d32-172c40167f77">content item link</a>,
            // an <a data-email-address="info@kentico.com" data-email-subject="Hi there!">e-mail link</a>
            // and an <a data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444">asset link</a>.</p>
            // Lowercase attribute keys
            var key, keys = Object.keys(attributes);
            var n = keys.length;
            var normalizedAttributes = {};
            while (n--) {
                key = keys[n];
                normalizedAttributes[key.toLowerCase()] = attributes[key];
            }
            var attributeKeys = Object.keys(normalizedAttributes);
            var linkTypeAttributes = attributeKeys.filter(function (v) { return _this._linkAttributes.includes(v); });
            if (linkTypeAttributes.length > 1) {
                _this.throw("The A element must contain only one of the following HTML attributes: " + _this._linkAttributes.join(',') + ". These attributes define the link type and the link type cannot be mixed.", context);
            }
            var linkTypeAttribute = linkTypeAttributes[0];
            if (!linkTypeAttribute) {
                _this.throw("The A element must have a 'href' attribute or a 'data-email-address' attribute or a data attribute that identifies the link target ('data-item-id', 'data-item-external-id', 'data-asset-id' or 'data-asset-external-id').", context);
            }
            switch (linkTypeAttribute) {
                case 'href':
                    {
                        if (!attributeKeys.includes('data-new-window')) {
                            normalizedAttributes['data-new-window'] = 'false';
                        }
                        if (!attributeKeys.includes('title')) {
                            normalizedAttributes['title'] = '';
                        }
                        if (Object.values(normalizedAttributes).length != 3) {
                            _this.throw("The A element that represents a URL link must have the 'href' attribute and, optionally, may have the 'data-new-window' and 'title' attributes.", context);
                        }
                        if (!['true', 'false'].includes(normalizedAttributes['data-new-window'].toLowerCase())) {
                            _this.throw("The 'data-new-window' attribute of an A element that represents a URL link must have a value 'true' or 'false'.", context);
                        }
                        var uri = _this.resolveUri(attributes['href']);
                        if (html_parser_1.isNullOrWhitespace(uri)) {
                            _this.throw("The 'href' attribute of an A element that represents a URL link must have a value.", context);
                        }
                        var webLink = new content_1.WebLinkNode(uri);
                        if (normalizedAttributes['title'] !== '')
                            webLink.title = normalizedAttributes['title'];
                        if (normalizedAttributes['data-new-window'].toLowerCase() === 'true')
                            webLink.target = content_1.WebLinkTargets.Blank;
                        return webLink;
                    }
                case 'data-item-id':
                    {
                        if (attributeKeys.length != 1) {
                            _this.throw("The A element that represents a content item link must have only a 'data-item-id' or a 'data-item-external-id' attribute.", context);
                        }
                        if (_this._guidRegex.test(normalizedAttributes['data-item-id'])) {
                            var contentItemLinkNode = new content_1.ContentItemLinkNode({ id: normalizedAttributes['data-item-id'] });
                            _this.references.push(new html_parser_1.Reference(contentItemLinkNode, context === null || context === void 0 ? void 0 : context.toReferenceContext()));
                            return contentItemLinkNode;
                        }
                        _this.throw("The A element that represents a content item link must have a 'data-item-id' or a 'data-item-external-id' attribute with a value that identifies a content item.", context);
                        break;
                    }
                case 'data-item-external-id':
                    {
                        if (attributeKeys.length != 1) {
                            _this.throw("The A element that represents a content item link must have only a 'data-item-id' or a 'data-item-external-id' attribute.", context);
                        }
                        var contentItemLinkNode = new content_1.ContentItemLinkNode({ externalId: normalizedAttributes['data-item-external-id'] });
                        _this.references.push(new html_parser_1.Reference(contentItemLinkNode, context === null || context === void 0 ? void 0 : context.toReferenceContext()));
                        return contentItemLinkNode;
                    }
                case 'data-asset-id':
                    {
                        if (attributeKeys.length != 1) {
                            _this.throw("The A element that represents an asset link must have only a 'data-asset-id' or a 'data-asset-external-id' attribute.", context);
                        }
                        if (_this._guidRegex.test(normalizedAttributes['data-asset-id'])) {
                            var assetLinkNode = new content_1.AssetLinkNode({ id: normalizedAttributes['data-asset-id'] });
                            _this.references.push(new html_parser_1.Reference(assetLinkNode, context === null || context === void 0 ? void 0 : context.toReferenceContext()));
                            return assetLinkNode;
                        }
                        _this.throw("The A element that represents an asset link must have a 'data-asset-id' or a 'data-asset-external-id' attribute with a value that identifies an asset.", context);
                        break;
                    }
                case 'data-asset-external-id':
                    {
                        if (attributeKeys.length != 1) {
                            _this.throw("The A element that represents an asset link must have only a 'data-asset-id' or a 'data-asset-external-id' attribute.", context);
                        }
                        var assetLinkNode = new content_1.AssetLinkNode({ externalId: normalizedAttributes['data-asset-external-id'] });
                        _this.references.push(new html_parser_1.Reference(assetLinkNode, context === null || context === void 0 ? void 0 : context.toReferenceContext()));
                        return assetLinkNode;
                    }
                case 'data-email-address':
                    {
                        if (!attributeKeys.includes('data-email-subject')) {
                            normalizedAttributes['data-email-subject'] = '';
                        }
                        if (Object.keys(normalizedAttributes).length != 2) {
                            _this.throw("The A element that represents an e-mail link must have only a 'data-email-address' attribute and an optional 'data-email-subject' attribute.", context);
                        }
                        if (html_parser_1.isNullOrWhitespace(normalizedAttributes['data-email-address'])) {
                            _this.throw("The 'data-email-address' attribute of an A element that represents an e-mail link must have a value.", context);
                        }
                        return new content_1.EmailLinkNode({
                            to: normalizedAttributes['data-email-address'],
                            subject: normalizedAttributes["data-email-subject"]
                        });
                    }
            }
            return null;
        };
        this.throw = function (message, context) {
            throw new Error(message + " (" + (context === null || context === void 0 ? void 0 : context.line) + ", " + (context === null || context === void 0 ? void 0 : context.column) + ")");
        };
        this.resolveUri = function (input) {
            // This code is compatible with Kentico Kontent UI client, see the getUrlRelativeOrWithProtocol function
            var cleanInput = decodeURI(input).replace(_this._whitespaceRegex, '');
            if (_this._unsafeProtocols.filter(function (x) { return cleanInput.toLowerCase().startsWith(x); }).length > 0 || !_this._protocolRegex.test(input)) {
                return "http://" + input;
            }
            return input;
        };
        this.createObjectElement = function (attributes, context, components) {
            if (Object.keys(attributes).length == 3 && _this.containsPair(attributes, 'type', 'application/kenticocloud')) {
                if (_this.containsPair(attributes, 'data-type', 'item')) {
                    return _this.createContentModule(attributes, context);
                }
                if (_this.containsPair(attributes, 'data-type', 'component')) {
                    return _this.createContentComponent(attributes, context, components);
                }
                _this.throw("The OBJECT element must have a 'data-type' attribute with a value 'item' or 'component'.", context);
            }
            _this.throw("The OBJECT element must have a 'type' attribute with a value 'application/kenticocloud', a 'data-type' attribute and a data attribute.", context);
            return null;
        };
        this.createContentModule = function (attributes, context) {
            if (Object.keys(attributes).includes('data-id') && _this._guidRegex.test(attributes['data-id'])) {
                var contentModuleElement_1 = new content_1.ContentModuleElement({ id: attributes['data-id'] });
                _this.references.push(new html_parser_1.Reference(contentModuleElement_1, context === null || context === void 0 ? void 0 : context.toReferenceContext()));
                return contentModuleElement_1;
            }
            if (Object.keys(attributes).includes('data-external-id')) {
                var contentModuleElement = new content_1.ContentModuleElement({ externalId: attributes['data-external-id'] });
                _this.references.push(new html_parser_1.Reference(contentModuleElement, context === null || context === void 0 ? void 0 : context.toReferenceContext()));
                return contentModuleElement;
            }
            _this.throw("The OBJECT element must have a data attribute that identifies a content item ('data-id' or 'data-external-id').", context);
            return null;
        };
        this.containsPair = function (attributes, key, value) {
            return Object.keys(attributes).includes(key) && attributes[key] == value;
        };
        this.createImageElement = function (attributes, image, context) {
            var attributeKeys = Object.keys(attributes);
            var containsId = attributeKeys.includes('data-asset-id');
            var containsExternalId = attributeKeys.includes('data-asset-external-id');
            if (!(attributeKeys.length == 1 && (containsId || containsExternalId))) {
                _this.throw("The FIGURE element must have only a data attribute that identifies an asset ('data-asset-id' or 'data-asset-external-id').", context);
            }
            if (containsId && !_this._guidRegex.test(attributes['data-asset-id'])) {
                _this.throw("The FIGURE element must have only a data attribute that identifies an asset ('data-asset-id' or 'data-asset-external-id').", context);
            }
            var imageElement = containsId && attributes['data-asset-id'] != _this._emptyGuid ?
                new content_1.ImageElement({ id: attributes['data-asset-id'] }) :
                new content_1.ImageElement({ externalId: attributes['data-asset-external-id'] });
            _this.references.push(new html_parser_1.Reference(imageElement, context ? context.toReferenceContext() : null));
            if (image) {
                if (!Object.keys(image.attributes).includes('src')) {
                    image.attributes['src'] = '#';
                }
                if (containsId && !Object.keys(image.attributes).includes('data-asset-id')) {
                    image.attributes['data-asset-id'] = attributes['data-asset-id'];
                }
                if (containsExternalId && !Object.keys(image.attributes).includes('data-asset-external-id')) {
                    image.attributes['data-asset-external-id'] = attributes['data-asset-external-id'];
                }
                if (Object.keys(image.attributes).length != 2) {
                    _this.throw("The IMG element must have a data attribute that identifies an asset ('data-asset-id' or 'data-asset-external-id')", context);
                }
                if (containsId && image.attributes['data-asset-id'] != attributes['data-asset-id']) {
                    _this.throw("The value of the 'data-asset-id' attribute of the IMG element does not correspond to the value from the FIGURE element.", context);
                }
                if (containsExternalId && image.attributes['data-asset-external-id'] != attributes['data-asset-external-id']) {
                    _this.throw("The value of the 'data-asset-external-id' attribute of the IMG element does not correspond to the value from the FIGURE element.", context);
                }
            }
            return imageElement;
        };
        this.createContentComponent = function (attributes, context, components) {
            if (Object.keys(attributes).includes('data-id') && _this._guidRegex.test(attributes["data-id"])) {
                var component = components === null || components === void 0 ? void 0 : components.filter(function (c) { return c.id == attributes['data-id']; })[0];
                if (!component) {
                    _this.throw("The component OBJECT has a data-id not matching any component in the components array.", context);
                    return null;
                }
                var contentComponentElement = new content_1.ContentComponentElement(attributes['data-id'], component.type.id, component.componentElements);
                return contentComponentElement;
            }
            _this.throw("The OBJECT element must have a 'data-id' attribute that identifies a content component.", context);
            return null;
        };
    }
    return ModelHelper;
}());
exports.ModelHelper = ModelHelper;
//# sourceMappingURL=model-helper.js.map