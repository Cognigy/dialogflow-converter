/* Node modules */
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import * as commandLineParams from "command-line-args";

function convertIntentsForFile(basePath: string, fileName: string, language: string) {
	/** read file contents first */
	const intentFilePath = join(basePath, `${fileName}.json`);
	const contents = readFileSync(intentFilePath, { encoding: 'utf8' });
	const parsedContents = JSON.parse(contents);

	/** read user utterances */
	const utterancesFilePath = join(basePath, `${fileName}_usersays_${language}.json`);
	const utterancesContents = readFileSync(utterancesFilePath, { encoding: 'utf8' });
	const parsedUtterancesContents = JSON.parse(utterancesContents);

	/** Destructure some values from dialogflow intent */
	const {
		name, // name of the intent
		responses, // our 'quick replies'
	} = parsedContents;

	/** get individual lines from 'responses' -> individual default reply lines! */
	const cognigyDefaultReplies = [];
	for (const response of responses) {
		const { messages } = response;

		for (const message of messages) {
			const { speech } = message;

			if (typeof speech === "string") {
				cognigyDefaultReplies.push(speech);
			} else if (Array.isArray(speech)) {
				speech.forEach((element) => cognigyDefaultReplies.push(element));
			}
		}
	}

	/** Get example sentences */
	const cognigyExampleSentences = [];
	for (const exampleSentence of parsedUtterancesContents) {
		const { data } = exampleSentence;

		let cognigyExampleSentence = "";

		for (const sentence of data) {
			const { text } = sentence;

			cognigyExampleSentence += text;
		}

		/** build cognigy example sentence */
		cognigyExampleSentences.push({ text: cognigyExampleSentence });
	}

	/** Create a Cognigy intent */
	const intent = {
		rules: [],
		name,
		currentlyValid: true,
		confirmationSentence: null,
		exampleSentences: cognigyExampleSentences,
		defaultReply: {
			text: cognigyDefaultReplies,
			data: {}
		}
	}

	return intent;
}

(async () => {
	const parsedArgs = commandLineParams([
		{ name: "language", type: String }
	]);

	const basePath = join(".", "assets", "intents");
	let { language } = parsedArgs;
	language = language ? language.toLowerCase() : "de";

	/** Read directory contents of 'assets' */
	const files = readdirSync(basePath, { encoding: 'utf8' })
		.filter(file => file.indexOf("_usersays_") === -1)
		.map(file => file.replace('.json', ''));

	/** Build intent array in the Cognigy.AI format */
	const cognigyIntents = files
		.map(file => convertIntentsForFile(basePath, file, language));

	console.log(`${cognigyIntents.length} Cognigy intents were generated!`);

	/** Build cognigy intent JSON */
	const intentJson = {
		rejectIntent: [],
		learnedSentences: [],
		intents: cognigyIntents
	};

	/** Write output back to disk */
	const outputPath = join(".", "assets", "cognigy-intents.json");
	const data = JSON.stringify(intentJson, undefined, 4);

	writeFileSync(outputPath, data, { encoding: 'utf8' });

	console.log(`Written and done!`);
})();