export function appendAttribute(text:string, name:string, value:string): string {
    text = text + ' ' + name + '="';
    for(const char of value) {
        switch(char) {
            case '&': text += '&amp;'; break;
            case '"': text += '&quot;'; break;
            case '\u00A0': text += '&nbsp;'; break;
            default: text += char; break;
        }
    }
    text += '"';

    return text;
}