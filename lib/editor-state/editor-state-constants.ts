export class EditorStateConstants {
    blockTypeSeparator = '/';

    static BlockTypes = class {
        static unstyled: string = 'unstyled';
        static contentModule: string = 'content-module';
        static image: string = 'image';
        static tableCell: string = 'table-cell';
        static orderedListItem: string = 'ordered-list-item';
        static contentComponent: string = 'content-component';
        static unorderedListItem: string = 'unordered-list-item';
        static H1: string = 'header-one';
        static H2: string = 'header-two';
        static H3: string = 'header-three';
        static H4: string = 'header-four';

        textBlockTypes: string[] = [
            EditorStateConstants.BlockTypes.unstyled,
            EditorStateConstants.BlockTypes.orderedListItem,
            EditorStateConstants.BlockTypes.unorderedListItem,
            EditorStateConstants.BlockTypes.H1,
            EditorStateConstants.BlockTypes.H2,
            EditorStateConstants.BlockTypes.H3,
            EditorStateConstants.BlockTypes.H4
        ];

        blockTypesWithRequiredSleeves: string[] = [
            EditorStateConstants.BlockTypes.image,
            EditorStateConstants.BlockTypes.tableCell,
            EditorStateConstants.BlockTypes.contentModule,
            EditorStateConstants.BlockTypes.contentComponent
        ];
    }

    static EntityTypes = class {
        link: string = 'LINK';
    }

    static Styles = class {
        bold: string = 'BOLD';
        italic: string = 'ITALIC';
        subscript: string = 'SUB';
        superscript: string = 'SUP';
        code: string = 'CODE';
    }

    static EntityMutability = class {
        mutable: string = 'MUTABLE';
        immutable: string = 'IMMUTABLE';
    }

    static LinkProperties = class {
        itemId: string = 'itemId';
        assetId: string = 'assetId';
        emailAddress: string = 'emailAddress';
        emailSubject: string = 'emailSubject';
        url: string = 'url';
        openInNewWindow: string = 'openInNewWindow';
        title: string = 'title';
    }

    static ImageProperties = class {
        guid: string = 'guid';
    }

    static ContentModuleProperties = class {
        itemId: string = 'guid';
    }

    static ContentComponentProperties = class {
        contentComponent: string = 'contentComponent';
    }
}