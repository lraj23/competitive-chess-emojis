import app from "./client.js";
import { getOptedIn, logInteraction, saveState } from "./datahandler.js";
const aiApiUrl = "https://openrouter.ai/api/v1/chat/completions";
const headers = {
	"Authorization": `Bearer ${process.env.CEMOJIS_AI_API_KEY}`,
	"Content-Type": "application/json"
};
const mainEmojis = [
	"chess-brilliant",
	"great",
	"bestmove",
	"real-chess-alternative",
	"excellent_move",
	"good_move",
	"real-chess-forced",
	"book_move",
	"inaccuracy",
	"real-chess-mistake",
	"real-chess-incorrect",
	"real-chess-missed-win",
	"blunder"
];
const sideEmojis = [
	"real-chess-checkmate",
	"real-chess-draw-black",
	"real-chess-fast-win",
	"real-chess-critical",
	"real-chess-free-piece"
];
const convoEmojis = [
	"real-chess-checkmate-white",
	"real-chess-checkmate-black",
	"real-chess-draw-white",
];
const systemMessage = `The user message consists of a message that is sent in a conversation. Your job is to analyze the message sent and determine how it might correspond as some chess move categories. For example, just like in a chess game, commonly known starting "moves," or messages, that are used at the beginning of a conversation are book moves (book_move). If a message is, based on the context, the most reasonable and most expectable message to send, it would be considered the best move (bestmove). If the message is, based on the context, just as reasonable as the expected bestmove, but less expected, it would be considered an alternative best move (real-chess-alternative). If a message is, based on the context, very reasonable and rather expectable, but maybe not the BEST response, it should be an excellent move (excellent_move). If a message is, based on the context, not bad, though not really the most expected and not really the best response, it should be a good move (good_move). If a message is, based on the context, BETTER than the most expected reasonable "best move," and a little unexpected while bringing a little extra information to the conversation, it should be a great move (great). If a message is, based on the context, much BETTER than a great move, very unexpected, provides a lot of new and radical information, and changes the direction of the conversation, it should be a brilliant move (chess-brilliant). If a message is, based on the context, the ONLY message that could possibly make sense, to the extent where it's basically just forced (for example if someone asks "Can you help me?" answering with "yes" or "ok" is forced), it should be a forced move (real-chess-forced). If a message is, based on the context, not really optimal, and not as good as maybe a good move, but still kind of ok, it should be an inaccuracy (inaccuracy). If a message is, based on the context, kind of bad, but not SUPER bad, yet still worse than an inaccuracy, it should be a mistake (real-chess-mistake). If a message is, based on the context, really bad, unreasonable, but still expectably the worst response, it should be a blunder (blunder). If, based on the context, there are many expected and pretty clear best and excellent moves, but the message sent is not any of them, instead being a simply acceptable message, the message should be considered a missed win (real-chess-missed-win). `
	+ `If, based on the context, there are many expected and pretty clear best and excellent moves, but the message sent is a different move that should be fine, but loses much of the "advantage" that could have been had, it should be considered an incorrect move (real-chess-incorrect). You need to choose EXACTLY ONE of the following strings, separated by a space: ${mainEmojis.join(", ")}. Additionally, you need to choose up to two of the other possible types of categories. If a message, based on the context, is also either the best move, great, or brilliant, as well as being something that doesn't really have a good reponse because it's kind of a conversational "checkmate," the move should be a checkmate (real-chess-checkmate). If a message, based on the context, is not a bad move, and basically results in no good response because nobody is like completely winning, and it's kind of like a stalemate of some sort, the move should be a draw (real-chess-draw-black). If, based on the context, it appears as though the conversation is very short, maybe within six to two to three messages, and the message could be classified as a checkmate, classify it instead as fast win (real-chess-fast-win). If a message is, based on the context, classifiable as any really good move (brilliant, great, or best), it should be classified as critical (real-chess-critical). If a message is, based on the context, a pretty bad move (mistake or blunder), and the move seems to give something away, like an opportunity or other advantage, it should be classified as a free piece (real-chess-free-piece). You need to choose anywhere from ZERO TO TWO of the following strings, separated by spaces: ${sideEmojis.join(", ")}. Your final output MUST be EXACTLY the list of all the strings you chose (the original classification as well as the secondary classifications), separated with EXACTLY a space in between each string and nothing else.
	
	Finally, this is the context of the conversation. Do consider, however, that it may be incomplete (missing some users). Just so you know, it's currently `;
const system_Message = `The user message consists of a message sent in a conversation. Your job is to analyze the message and determine how it would fit as a chess move. `
	+ `For example, a VERY common question or statement that might usually start a conversation would be a book move. A book move should ONLY be chosen if the message makes sense to start a conversation. `
	+ `The best response to a question or statement would likely be a best move. A response that might not be the best but is still good and understandable would be an excellent move. `
	// + `A simply acceptable response would be a good move. `
	+ `A message that is a bit of a mistake or worse than a good move would be an inaccuracy. Worse than that, a mistake. Even worse, a blunder. A message that is unexpected but much better than the expected best move is a great move. A message that is very unexpected, brings more information, and is far beyond the expected best message would be considered a brilliant move. Finally, a message that had a really obvious best move that wasn't said could possibly be a miss instead. What you HAVE to do is respond EXACTLY with EXACTLY TWO of these following strings according to your best analysis: ${mainEmojis.join(", ")}. Separate the two strings with a space and nothing else.`
	+ `	
	Here is the context of the current conversation (it may be incomplete, so don't rely FULLY on this):
	`;
const lraj23BotTestingId = "C09GR27104V";

app.message('', async ({ message }) => {
	const optedIn = getOptedIn();
	if (!optedIn.reactOptedIn.includes(message.user)) {
		if (message.channel === lraj23BotTestingId) await app.client.chat.postEphemeral({
			channel: lraj23BotTestingId,
			user: message.user,
			blocks: [
				{
					"type": "section",
					"text": {
						"type": "mrkdwn",
						"text": `You aren't opted in to Chess Emojis Reactions! Opt in with /ccemojis-game-opt-in`
					}
				}
			],
			text: `You aren't opted in to Chess Emojis Reactions! Opt in with /ccemojis-game-opt-in`,
			thread_ts: ((message.thread_ts == message.ts) ? undefined : message.thread_ts)
		});
		return;
	}
	if (message.text.toLowerCase().includes("secret button")) {
		await app.client.reactions.add({
			"channel": message.channel,
			"name": mainEmojis[0],
			"timestamp": message.ts
		});
		return;
	}
	let pastMessages = await app.client.conversations.history({
		token: process.env.CEMOJIS_BOT_TOKEN,
		channel: message.channel,
		latest: Date.now(),
		limit: 30
	});
	pastMessages = pastMessages.messages.filter((msg, i) => (optedIn.dataOptedIn.includes(msg.user) && i)).reverse();
	console.log(pastMessages);
	console.log(message.text);
	const response = await fetch(aiApiUrl, {
		method: "POST",
		headers,
		body: JSON.stringify({
			"model": "openai/gpt-oss-120b",
			"messages": [
				{
					"role": "system",
					"content": systemMessage + new Date(Date.now()).toString() + ":\n" + pastMessages.map(msg => "User " + msg.user + " said (on " + new Date(1000 * msg.ts).toString() + "): " + msg.text).join("\n")
				},
				{
					"role": "user",
					"content": message.text
				}
			]
		})
	});
	const data = await response.json();
	console.log(data.choices[0].message);
	let reactions = data.choices[0].message.content.split(" ");
	reactions.forEach(async reaction => await app.client.reactions.add({
		"channel": message.channel,
		"name": [...mainEmojis, ...sideEmojis, ...convoEmojis].includes(reaction) ? reaction : "error_web",
		"timestamp": message.ts
	}));
	if (optedIn.explanationOptedIn.includes(message.user)) await app.client.chat.postEphemeral({
		channel: message.channel,
		user: message.user,
		text: data.choices[0].message.reasoning || ":error_web:",
		thread_ts: ((message.thread_ts == message.ts) ? undefined : message.thread_ts)
	});
});

app.command('/ccemojis-data-opt-in', async (interaction) => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.payload.user_id;
	let optedIn = getOptedIn();

	if (optedIn.dataOptedIn.includes(userId)) {
		await interaction.client.chat.postEphemeral({
			"channel": interaction.command.channel_id,
			"user": userId,
			"text": `You have already opted into the Competitive Chess Emojis bot's data collection! :${mainEmojis[8]}:`
		});
		return;
	}

	await interaction.client.chat.postEphemeral({
		"channel": interaction.command.channel_id,
		"user": userId,
		"text": `You opted into the Competitive Chess Emoji bot's data collection!! :${mainEmojis[4]}:`
	});
	optedIn.dataOptedIn.push(userId);
	saveState(optedIn);
});

app.command('/ccemojis-game-opt-in', async (interaction) => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.payload.user_id;
	let optedIn = getOptedIn();

	if (optedIn.reactOptedIn.includes(userId)) {
		await interaction.client.chat.postEphemeral({
			"channel": interaction.command.channel_id,
			"user": userId,
			"text": `You have already opted into the Competitive Chess Emojis game! :${mainEmojis[8]}:`
		});
		return;
	}

	await interaction.client.chat.postEphemeral({
		"channel": interaction.command.channel_id,
		"user": userId,
		"text": `You opted into the Competitive Chess Emojis game!! :${sideEmojis[3]}: This also opts you into the bot's data collection.`
	});
	optedIn.reactOptedIn.push(userId);
	if (!optedIn.dataOptedIn.includes(userId)) optedIn.dataOptedIn.push(userId);
	saveState(optedIn);
});

app.command('/ccemojis-explain-opt-in', async (interaction) => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.payload.user_id;
	let optedIn = getOptedIn();

	if (optedIn.explanationOptedIn.includes(userId)) {
		await interaction.client.chat.postEphemeral({
			"channel": interaction.command.channel_id,
			"user": userId,
			"text": `You have already opted into the Competitive Chess Emojis bot's explanations! :${mainEmojis[8]}:`
		});
		return;
	}
	
	await interaction.client.chat.postEphemeral({
		"channel": interaction.command.channel_id,
		"user": userId,
		"text": `You opted into the Competitive Chess Emoji bot's explanations!! :${mainEmojis[1]}: This also opts you into the game and data collection.`
	});
	optedIn.explanationOptedIn.push(userId);
	if (!optedIn.reactOptedIn.includes(userId)) optedIn.reactOptedIn.push(userId);
	if (!optedIn.dataOptedIn.includes(userId)) optedIn.dataOptedIn.push(userId);
	saveState(optedIn);
});

app.command('/ccemojis-data-opt-out', async (interaction) => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.payload.user_id;
	let optedIn = getOptedIn();

	if (optedIn.dataOptedIn.includes(userId)) {
		await interaction.client.chat.postEphemeral({
			"channel": interaction.command.channel_id,
			"user": userId,
			"text": `You opted out of the Competitive Chess Emoji bot's data collection. :${mainEmojis[9]}: This also opts you out of the game and explanations.`
		});
		optedIn.dataOptedIn.splice(optedIn.dataOptedIn.indexOf(userId), 1);
		if (optedIn.reactOptedIn.includes(userId)) optedIn.reactOptedIn.splice(optedIn.reactOptedIn.indexOf(userId), 1);
		if (optedIn.explanationOptedIn.includes(userId)) optedIn.explanationOptedIn.splice(optedIn.explanationOptedIn.indexOf(userId), 1);
		saveState(optedIn);
		return;
	}
	
	await interaction.client.chat.postEphemeral({
		"channel": interaction.command.channel_id,
		"user": userId,
		"text": `You can't opt out because you aren't opted into the Competitive Chess Emojis bot's data collection! :${sideEmojis[4]}:`
	});
});

app.command('/ccemojis-game-opt-out', async (interaction) => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.payload.user_id;
	let optedIn = getOptedIn();
	
	if (optedIn.reactOptedIn.includes(userId)) {
		await interaction.client.chat.postEphemeral({
			"channel": interaction.command.channel_id,
			"user": userId,
			"text": `You opted out of the Competitive Chess Emojis game. :${sideEmojis[0]}: This also opts you out of the bot's explanations.`
		});
		optedIn.reactOptedIn.splice(optedIn.reactOptedIn.indexOf(userId), 1);
		if (optedIn.explanationOptedIn.includes(userId)) optedIn.explanationOptedIn.splice(optedIn.explanationOptedIn.indexOf(userId), 1);
		saveState(optedIn);
		return;
	}
	
	await interaction.client.chat.postEphemeral({
		"channel": interaction.command.channel_id,
		"user": userId,
		"text": `You can't opt out because you aren't opted into the Competitive Chess Emojis game! :${sideEmojis[4]}:`
	});
});

app.command('/ccemojis-explain-opt-out', async (interaction) => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.payload.user_id;
	let optedIn = getOptedIn();

	if (optedIn.explanationOptedIn.includes(userId)) {
		await interaction.client.chat.postEphemeral({
			"channel": interaction.command.channel_id,
			"user": userId,
			"text": `You opted out of the Competitive Chess Emoji bot's explanations. :${mainEmojis[11]}:`
		});
		optedIn.explanationOptedIn.splice(optedIn.explanationOptedIn.indexOf(userId), 1);
		saveState(optedIn);
		return;
	}

	await interaction.client.chat.postEphemeral({
		"channel": interaction.command.channel_id,
		"user": userId,
		"text": `You can't opt out because you aren't opted into the Competitive Chess Emojis bot's explanations! :${sideEmojis[4]}:`
	});
});

app.message(/secret button/i, async ({ message, say }) => {
	// say() sends a message to the channel where the event was triggered
	await app.client.chat.postEphemeral({
		channel: message.channel,
		user: message.user,
		blocks: [
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": `<@${message.user}> mentioned the secret button! Here it is:`
				}
			},
			{
				"type": "actions",
				"elements": [
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": "Secret Button :" + mainEmojis[0] + ":"
						},
						"action_id": "button_click"
					}
				]
			}
		],
		text: `<@${message.user}> mentioned the secret button! Here it is:`,
		thread_ts: ((message.thread_ts == message.ts) ? undefined : message.thread_ts)
	});
});

app.action('button_click', async ({ body, ack, respond }) => {
	// Acknowledge the action
	await ack();
	console.log(body.channel.id, body.user.id, body.container.message_ts, body.container, body.container.message);
	await app.client.chat.postEphemeral({
		channel: body.channel.id,
		user: body.user.id,
		blocks: [
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": `You found the secret button :${mainEmojis[0]}: Here it is again.`
				}
			},
			{
				"type": "actions",
				"elements": [
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": "Secret Button :" + mainEmojis[0] + ":"
						},
						"action_id": "button_click"
					}
				]
			}
		],
		text: `You found the secret button :${mainEmojis[0]}: Here it is again.`,
		thread_ts: body.container.thread_ts || undefined
	});
});