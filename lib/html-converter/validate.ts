import { HtmlConverter } from '../html-converter';

export class KontentRichText {
    static validate = (text: string) => {
        try {
            const converter = new HtmlConverter(true);
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