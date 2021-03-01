export enum TokenType {
    PlainText, // abc
    ClosingTag, // </a>
    OpeningTagBeginning, // <strong
    AttributeName, // href
    AttributeValue, // http://www.google.com
    OpeningTagEnd, // >
    OpeningTagSelfClosing // />
}