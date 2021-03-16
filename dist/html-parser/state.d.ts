export declare enum State {
    Start = 0,
    InPlainText = 1,
    TagStarted = 2,
    ClosingTagStarted = 3,
    InClosingTagName = 4,
    InClosingTag = 5,
    InOpeningTagName = 6,
    InOpeningTag = 7,
    InAttributeName = 8,
    AfterAttributeName = 9,
    AttributeAssignmentStarted = 10,
    AttributeValueStarted = 11,
    InAttributeValue = 12,
    SelfClosingStarted = 13
}
