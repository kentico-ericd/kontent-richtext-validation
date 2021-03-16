export declare class EditorStateConstants {
    blockTypeSeparator: string;
    static BlockTypes: {
        new (): {
            textBlockTypes: string[];
            blockTypesWithRequiredSleeves: string[];
        };
        unstyled: string;
        contentModule: string;
        image: string;
        tableCell: string;
        orderedListItem: string;
        contentComponent: string;
        unorderedListItem: string;
        H1: string;
        H2: string;
        H3: string;
        H4: string;
    };
    static EntityTypes: {
        new (): {
            link: string;
        };
    };
    static Styles: {
        new (): {
            bold: string;
            italic: string;
            subscript: string;
            superscript: string;
            code: string;
        };
    };
    static EntityMutability: {
        new (): {
            mutable: string;
            immutable: string;
        };
    };
    static LinkProperties: {
        new (): {
            itemId: string;
            assetId: string;
            emailAddress: string;
            emailSubject: string;
            url: string;
            openInNewWindow: string;
            title: string;
        };
    };
    static ImageProperties: {
        new (): {
            guid: string;
        };
    };
    static ContentModuleProperties: {
        new (): {
            itemId: string;
        };
    };
    static ContentComponentProperties: {
        new (): {
            contentComponent: string;
        };
    };
}
