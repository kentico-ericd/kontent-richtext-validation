export enum State {
    Start,
    InPlainText,
    TagStarted,
    ClosingTagStarted,
    InClosingTagName,
    InClosingTag,
    InOpeningTagName,
    InOpeningTag,
    InAttributeName,
    AfterAttributeName,
    AttributeAssignmentStarted,
    AttributeValueStarted,
    InAttributeValue,
    SelfClosingStarted
}