"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorStateConstants = void 0;
var EditorStateConstants = /** @class */ (function () {
    function EditorStateConstants() {
        this.blockTypeSeparator = '/';
    }
    var _a;
    EditorStateConstants.BlockTypes = (_a = /** @class */ (function () {
            function class_1() {
                this.textBlockTypes = [
                    EditorStateConstants.BlockTypes.unstyled,
                    EditorStateConstants.BlockTypes.orderedListItem,
                    EditorStateConstants.BlockTypes.unorderedListItem,
                    EditorStateConstants.BlockTypes.H1,
                    EditorStateConstants.BlockTypes.H2,
                    EditorStateConstants.BlockTypes.H3,
                    EditorStateConstants.BlockTypes.H4
                ];
                this.blockTypesWithRequiredSleeves = [
                    EditorStateConstants.BlockTypes.image,
                    EditorStateConstants.BlockTypes.tableCell,
                    EditorStateConstants.BlockTypes.contentModule,
                    EditorStateConstants.BlockTypes.contentComponent
                ];
            }
            return class_1;
        }()),
        _a.unstyled = 'unstyled',
        _a.contentModule = 'content-module',
        _a.image = 'image',
        _a.tableCell = 'table-cell',
        _a.orderedListItem = 'ordered-list-item',
        _a.contentComponent = 'content-component',
        _a.unorderedListItem = 'unordered-list-item',
        _a.H1 = 'header-one',
        _a.H2 = 'header-two',
        _a.H3 = 'header-three',
        _a.H4 = 'header-four',
        _a);
    EditorStateConstants.EntityTypes = /** @class */ (function () {
        function class_2() {
            this.link = 'LINK';
        }
        return class_2;
    }());
    EditorStateConstants.Styles = /** @class */ (function () {
        function class_3() {
            this.bold = 'BOLD';
            this.italic = 'ITALIC';
            this.subscript = 'SUB';
            this.superscript = 'SUP';
            this.code = 'CODE';
        }
        return class_3;
    }());
    EditorStateConstants.EntityMutability = /** @class */ (function () {
        function class_4() {
            this.mutable = 'MUTABLE';
            this.immutable = 'IMMUTABLE';
        }
        return class_4;
    }());
    EditorStateConstants.LinkProperties = /** @class */ (function () {
        function class_5() {
            this.itemId = 'itemId';
            this.assetId = 'assetId';
            this.emailAddress = 'emailAddress';
            this.emailSubject = 'emailSubject';
            this.url = 'url';
            this.openInNewWindow = 'openInNewWindow';
            this.title = 'title';
        }
        return class_5;
    }());
    EditorStateConstants.ImageProperties = /** @class */ (function () {
        function class_6() {
            this.guid = 'guid';
        }
        return class_6;
    }());
    EditorStateConstants.ContentModuleProperties = /** @class */ (function () {
        function class_7() {
            this.itemId = 'guid';
        }
        return class_7;
    }());
    EditorStateConstants.ContentComponentProperties = /** @class */ (function () {
        function class_8() {
            this.contentComponent = 'contentComponent';
        }
        return class_8;
    }());
    return EditorStateConstants;
}());
exports.EditorStateConstants = EditorStateConstants;
