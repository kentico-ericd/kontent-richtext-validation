import { HtmlConverter } from '../html-converter';

export class KontentRichText {
    static validate = (text: string, ignoreComponents: boolean = false) => {
        try {
            const converter = new HtmlConverter(true, ignoreComponents);
            const model = converter.convertFromHtml(text);
            const result = converter.convertToHtml(model);

            return {
                success: true,
                message: result
            }
        }
        catch(e) {
            return {
                success: false,
                message: e.message
            };
        }
    }
}