export function appendText(text:string, append:string): string {
    for(const character of append)
        {
            switch (character)
            {
                case '&': text += "&amp;"; break;
                case '<': text += "&lt;"; break;
                case '>': text += "&gt;"; break;
                case '\u00A0': text += "&nbsp;"; break;
                default: text += character; break;
            }
        }

    return text;
}