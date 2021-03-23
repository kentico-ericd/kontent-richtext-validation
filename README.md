# Kontent Rich Text Validator

This package provides a function for validating the content of Rich Text elements. It can be used in conjunction with the [Kontent Management JS SDK](https://github.com/Kentico/kontent-management-sdk-js) or our [REST API](https://docs.kontent.ai/reference/management-api-v2#operation/upsert-a-language-variant) to ensure the text is in the correct format _before_ the data is sent to Kontent.

This can speed up the development process (e.g. when writing [webhooks](https://docs.kontent.ai/tutorials/develop-apps/integrate/webhooks?tech=javascript)) and prevent errors while updating content, as errors can be resolved without the need for submitting repeated API calls, and could be integrated into testing scenarios.

## Installation

Install via NPM:

`npm i @kentico-ericd/kontent-richtext-validation --save`

## Usage

```js
// Typescript + ES
import { KontentRichText } from '@kentico-ericd/kontent-richtext-validation'
```

```js
// CommonJS
const { KontentRichText } = require('@kentico-ericd/kontent-richtext-validation');
```

The `KontentRichText` class provides a `validate()` function, which returns the following object:

```js
{
  success: <boolean>,
  message: <string>
}
```

In the event that there is an error parsing the input, `success` will be _false_ and `message` will contain the error and (in most cases) the exact position of the faulty text. On success, the `message` should contain the exact text that was passed to the function.

For example:

```js
KontentRichText.validate('<p><a hrf="https://kontent.ai">Kentico Kontent</a></p>')
```
```js
{
  success: false,
  message: "The A element must have a 'href' attribute or a 'data-email-address' attribute or a data attribute that identifies the link 
target ('data-item-id', 'data-item-external-id', 'data-asset-id' or 'data-asset-external-id'). (1, 30)"
}
```

We can see that the error occurred on line 1, col 30 which is the closing double-quote of the _href_ attribute.

## Example

This package could be integrated into the [automatic translation webhook](https://github.com/Kentico/kontent-sample-app-express-js#automatic-content-translation) of the sample ExpressJS application. Perhaps we want to _always_ return a 200 (success) response to Kontent when the webhook triggers, so that the webhook doesn't receive errors and stop processing. Or, we could validate the text and if there is some error, we can skip that item and continue with the rest of them.

Specifically, it could be added to [this line](https://github.com/Kentico/kontent-sample-app-express-js/blob/master/routes/webhook.js#L119) where we get translated text from an external service. Maybe the external service accidentally changed some of the HTML? Let's check:

```js
if (match.length > 0) {
	e.value = text.replace(/<br>/g, '<br/>');
	const validationResult = KontentRichText.validate(e.value);
	if(!validationResult.success) {
		const error = `Validation failed for item ${updatedVariant.data.item.id} element ${e.id}: ${validationResult.message}`;

        // We can log the error
        console.log(error);
        // We could write to some physical log file too
        writeToLogFile(error);
        // Send an email to devs?
        sendEmail('devs@mysite.com', 'Webhook error', error);
        // Skip this variant but continue with others
        stopProcessing = true;
        // or, maybe throw an error
        throw new Error(error);
	}
}
```