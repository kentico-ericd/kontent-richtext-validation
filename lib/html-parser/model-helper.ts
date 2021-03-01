import { Reference, Token, Image, isNullOrWhitespace } from '../html-parser';
import { decode } from 'html-entities';
import { TextNode,
    EntityNode,
    IContentElement,
    ContentComponentElement,
    ContentModuleElement,
    EmailLinkNode,
    AssetLinkNode,
    ImageElement,
    WebLinkNode,
    WebLinkTargets,
    ContentItemLinkNode } from '../content';

export class ModelHelper {
    references: Reference[] = [];
    private _whitespace: string[] = ['\t', '\n', '\f', '\r', ' '];
    private _linkAttributes: string[] = [
        'href',
        'data-item-id',
        'data-item-external-id',
        'data-asset-id',
        'data-asset-external-id',
        'data-email-address'
    ];
    private _emptyGuid: string = '00000000-0000-0000-0000-000000000000';

    // Required when resolving URL links
    private _unsafeProtocols: string[] = ['javascript:', 'data:', 'vbscript:'];
    private _guidRegex: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    private _whitespaceRegex: RegExp = /[^\\w:]/m;
    private _protocolRegex: RegExp = new RegExp('^(([A-Z]+://.+)|\\?|#|/)', 'i');

    constructor() { }

    createTextNode = (text: string): TextNode => {
        return new TextNode(decode(this.normalizeWhiteSpaces(text)));
    }

    private normalizeWhiteSpaces = (text: string) => {
        var index = 0;

        var src = text;
        var skip = false;
        for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            if (this._whitespace.includes(ch)) {
                if (skip)
                    continue;
                src = this.setCharAt(src, index++, ' ');
                skip = true;
            }
            else {
                src = this.setCharAt(src, index++, ch);
                skip = false;
            }
        }

        return src;
    }

    private setCharAt = (str: string, index: number, chr: string): string => {
        if (index > str.length - 1) return str;
        return str.substring(0, index) + chr + str.substring(index + 1);
    }

    createLink = (attributes: Record<string, string>, context: Token | null): EntityNode | null => {
        // <p>Text with a <a href="http://www.kentico.com">URL link</a>,
        // a <a href="http://www.kentico.com" data-new-window="true">URL link that opens in a new window</a>,
        // a <a data-item-id="7819dd59-1aa3-4c03-9d32-172c40167f77">content item link</a>,
        // an <a data-email-address="info@kentico.com" data-email-subject="Hi there!">e-mail link</a>
        // and an <a data-asset-id="30a3a8c2-e9ab-47c2-84f4-e470985a3444">asset link</a>.</p>

        const attributeKeys = Object.keys(attributes);
        const linkTypeAttributes = attributeKeys.filter(v => this._linkAttributes.includes(v.toLowerCase()));
        if (linkTypeAttributes.length > 1) {
            this.throw(`The A element must contain only one of the following HTML attributes: ${this._linkAttributes.join(',')}. These attributes define the link type and the link type cannot be mixed.`, context);
        }

        const linkTypeAttribute = linkTypeAttributes[0];
        if (linkTypeAttribute) {
            this.throw(`The A element must have a 'href' attribute or a 'data-email-address' attribute or a data attribute that identifies the link target ('data-item-id', 'data-item-external-id', 'data-asset-id' or 'data-asset-external-id').`, context);
        }

        switch (linkTypeAttribute.toLowerCase()) {
            case 'href':
                {
                    if (!attributeKeys.includes('data-new-window')) {
                        attributes['data-new-window'] = 'false';
                    }

                    if (!attributeKeys.includes('title')) {
                        attributes['title'] = '';
                    }

                    if (Object.values(attributes).length != 3) {
                        this.throw(`The A element that represents a URL link must have the 'href' attribute and, optionally, may have the 'data-new-window' and 'title' attributes.`, context);
                    }

                    if (!['true', 'false'].includes(attributes['data-new-window'].toLowerCase())) {
                        this.throw(`The 'data-new-window' attribute of an A element that represents a URL link must have a value 'true' or 'false'.`, context);
                    }

                    var uri = this.resolveUri(attributes['href']);

                    if (isNullOrWhitespace(uri)) {
                        this.throw(`The 'href' attribute of an A element that represents a URL link must have a value.`, context);
                    }

                    return new WebLinkNode(
                        uri,
                        attributes['data-new-window'].toLowerCase() === 'true' ? WebLinkTargets.Blank : WebLinkTargets.Self,
                        attributes['title']
                    );
                }
            case 'data-item-id':
                {
                    if (attributeKeys.length != 1) {
                        this.throw(`The A element that represents a content item link must have only a 'data-item-id' or a 'data-item-external-id' attribute.`, context);
                    }

                    if (this._guidRegex.test(attributes['data-item-id'])) {
                        const contentItemLinkNode = new ContentItemLinkNode({ id: attributes['data-item-id'] });
                        this.references.push(new Reference(contentItemLinkNode, context?.toReferenceContext()));
                        return contentItemLinkNode;
                    }

                    this.throw(`The A element that represents a content item link must have a 'data-item-id' or a 'data-item-external-id' attribute with a value that identifies a content item.`, context);
                    break;
                }
            case 'data-item-external-id':
                {
                    if (attributeKeys.length != 1) {
                        this.throw(`The A element that represents a content item link must have only a 'data-item-id' or a 'data-item-external-id' attribute.`, context);
                    }

                    const contentItemLinkNode = new ContentItemLinkNode({ externalId: attributes['data-item-external-id'] });
                    this.references.push(new Reference(contentItemLinkNode, context?.toReferenceContext()));

                    return contentItemLinkNode;
                }
            case 'data-asset-id':
                {
                    if (attributeKeys.length != 1) {
                        this.throw(`The A element that represents an asset link must have only a 'data-asset-id' or a 'data-asset-external-id' attribute.`, context);
                    }

                    if (this._guidRegex.test(attributes['data-asset-id'])) {
                        var assetLinkNode = new AssetLinkNode({ id: attributes['data-asset-id'] });
                        this.references.push(new Reference(assetLinkNode, context?.toReferenceContext()));

                        return assetLinkNode;
                    }

                    this.throw(`The A element that represents an asset link must have a 'data-asset-id' or a 'data-asset-external-id' attribute with a value that identifies an asset.`, context);
                    break;
                }
            case 'data-asset-external-id':
                {
                    if (attributeKeys.length != 1) {
                        this.throw(`The A element that represents an asset link must have only a 'data-asset-id' or a 'data-asset-external-id' attribute.`, context);
                    }

                    var assetLinkNode = new AssetLinkNode({ externalId: attributes['data-asset-external-id'] });
                    this.references.push(new Reference(assetLinkNode, context?.toReferenceContext()));

                    return assetLinkNode;
                }
            case 'data-email-address':
                {
                    if (!attributeKeys.includes('data-email-subject')) {
                        attributes['data-email-subject'] = '';
                    }

                    if (attributeKeys.length != 2) {
                        this.throw(`The A element that represents an e-mail link must have only a 'data-email-address' attribute and an optional 'data-email-subject' attribute.`, context);
                    }

                    if (isNullOrWhitespace(attributes['data-email-address'])) {
                        this.throw(`The 'data-email-address' attribute of an A element that represents an e-mail link must have a value.`, context);
                    }

                    return new EmailLinkNode({
                        to: attributes['data-email-address'],
                        subject: attributes["data-email-subject"]
                    });
                }
        }

        return null;
    }

    private throw = (message: string, context: Token | null) => {
        throw new Error(`${message} (${context?.line}, ${context?.column})`);
    }

    private resolveUri = (input: string): string => {
        // This code is compatible with Kentico Kontent UI client, see the getUrlRelativeOrWithProtocol function
        var cleanInput = decodeURI(input).replace(this._whitespaceRegex, '');

        if (this._unsafeProtocols.filter(x => cleanInput.toLowerCase().startsWith(x)).length > 0 || !this._protocolRegex.test(input)) {
            return `http://${input}`;
        }

        return input;
    }

    createObjectElement = (attributes: Record<string, string>, context: Token | null, components?: ContentComponentElement[] | null): IContentElement | null => {
        if (Object.keys(attributes).length == 3 && this.containsPair(attributes, 'type', 'application/kenticocloud')) {
            if (this.containsPair(attributes, 'data-type', 'item')) {
                return this.createContentModule(attributes, context);
            }

            if (this.containsPair(attributes, 'data-type', 'component')) {
                return this.createContentComponent(attributes, context, components);
            }

            this.throw(`The OBJECT element must have a 'data-type' attribute with a value 'item' or 'component'.`, context);
        }

        this.throw(`The OBJECT element must have a 'type' attribute with a value 'application/kenticocloud', a 'data-type' attribute and a data attribute.`, context);
        return null;
    }

    private createContentModule = (attributes: Record<string, string>, context: Token | null): IContentElement | null => {
        if (Object.keys(attributes).includes('data-id') && this._guidRegex.test(attributes['data-id'])) {
            const contentModuleElement = new ContentModuleElement({ id: attributes['data-id'] });
            this.references.push(new Reference(contentModuleElement, context?.toReferenceContext()));

            return contentModuleElement;
        }

        if (Object.keys(attributes).includes('data-external-id')) {
            var contentModuleElement = new ContentModuleElement({ externalId: attributes['data-external-id'] });
            this.references.push(new Reference(contentModuleElement, context?.toReferenceContext()));

            return contentModuleElement;
        }

        this.throw(`The OBJECT element must have a data attribute that identifies a content item ('data-id' or 'data-external-id').`, context);
        return null;
    }

    containsPair = (attributes: Record<string, string>, key: string, value: string): boolean => {
        return Object.keys(attributes).includes(key) && attributes[key] == value;
    }

    createImageElement = (attributes: Record<string, string>, image: Image | null, context: Token | null): ImageElement => {
        const attributeKeys = Object.keys(attributes);
        const containsId = attributeKeys.includes('data-asset-id');
        const containsExternalId = attributeKeys.includes('data-asset-external-id');

        if (!(attributeKeys.length == 1 && (containsId || containsExternalId))) {
            this.throw(`The FIGURE element must have only a data attribute that identifies an asset ('data-asset-id' or 'data-asset-external-id').`, context);
        }

        if (containsId && !this._guidRegex.test(attributes['data-asset-id'])) {
            this.throw(`The FIGURE element must have only a data attribute that identifies an asset ('data-asset-id' or 'data-asset-external-id').`, context);
        }

        const imageElement = containsId && attributes['data-asset-id'] != this._emptyGuid ?
            new ImageElement({ id: attributes['data-asset-id'] }) :
            new ImageElement({ externalId: attributes['data-asset-external-id'] });

        this.references.push(new Reference(imageElement, context ? context.toReferenceContext() : null));

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
                this.throw(`The IMG element must have a data attribute that identifies an asset ('data-asset-id' or 'data-asset-external-id')`, context);
            }

            if (containsId && image.attributes['data-asset-id'] != attributes['data-asset-id']) {
                this.throw(`The value of the 'data-asset-id' attribute of the IMG element does not correspond to the value from the FIGURE element.`, context);
            }

            if (containsExternalId && image.attributes['data-asset-external-id'] != attributes['data-asset-external-id']) {
                this.throw(`The value of the 'data-asset-external-id' attribute of the IMG element does not correspond to the value from the FIGURE element.`, context);
            }
        }

        return imageElement;
    }

    private createContentComponent = (attributes: Record<string, string>, context: Token | null, components?: ContentComponentElement[] | null): IContentElement | null => {
        if (Object.keys(attributes).includes('data-id') && this._guidRegex.test(attributes["data-id"])) {
            const component = components?.filter(c => c.id == attributes['data-id'])[0];
            if (!component) {
                this.throw("The component OBJECT has a data-id not matching any component in the components array.", context);
                return null;
            }

            const contentComponentElement = new ContentComponentElement(attributes['data-id'], component.type.id, component.componentElements);
            return contentComponentElement;
        }

        this.throw("The OBJECT element must have a 'data-id' attribute that identifies a content component.", context);
        return null;
    }
}
