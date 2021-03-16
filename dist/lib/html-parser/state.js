"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
var State;
(function (State) {
    State[State["Start"] = 0] = "Start";
    State[State["InPlainText"] = 1] = "InPlainText";
    State[State["TagStarted"] = 2] = "TagStarted";
    State[State["ClosingTagStarted"] = 3] = "ClosingTagStarted";
    State[State["InClosingTagName"] = 4] = "InClosingTagName";
    State[State["InClosingTag"] = 5] = "InClosingTag";
    State[State["InOpeningTagName"] = 6] = "InOpeningTagName";
    State[State["InOpeningTag"] = 7] = "InOpeningTag";
    State[State["InAttributeName"] = 8] = "InAttributeName";
    State[State["AfterAttributeName"] = 9] = "AfterAttributeName";
    State[State["AttributeAssignmentStarted"] = 10] = "AttributeAssignmentStarted";
    State[State["AttributeValueStarted"] = 11] = "AttributeValueStarted";
    State[State["InAttributeValue"] = 12] = "InAttributeValue";
    State[State["SelfClosingStarted"] = 13] = "SelfClosingStarted";
})(State = exports.State || (exports.State = {}));
//# sourceMappingURL=state.js.map