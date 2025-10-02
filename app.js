import app from "./client.js";
import { getOptedIn, logInteraction, saveState } from "./datahandler.js";
const aiApiUrl = "https://openrouter.ai/api/v1/chat/completions";
const headers = {
	"Authorization": `Bearer ${process.env.CEMOJIS_AI_API_KEY}`,
	"Content-Type": "application/json"
};
const reaction_emojis = [
	"chess-brilliant",
	"great",
	"bestmove",
	"excellent_move",
	// "good_move",
	"book_move",
	"inaccuracy",
	"real-chess-mistake",
	"real-chess-missed-win",
	"blunder"
];
const systemMessage = `The user message consists of a message sent in a conversation. Your job is to analyze the message and determine how it would fit as a chess move. `
	+ `For example, a VERY common question or statement that might usually start a conversation would be a book move. A book move should ONLY be chosen if the message makes sense to start a conversation. `
	+ `The best response to a question or statement would likely be a best move. A response that might not be the best but is still good and understandable would be an excellent move. `
	// + `A simply acceptable response would be a good move. `
	+ `A message that is a bit of a mistake or worse than a good move would be an inaccuracy. Worse than that, a mistake. Even worse, a blunder. A message that is unexpected but much better than the expected best move is a great move. A message that is very unexpected, brings more information, and is far beyond the expected best message would be considered a brilliant move. Finally, a message that had a really obvious best move that wasn't said could possibly be a miss instead. What you HAVE to do is respond EXACTLY with EXACTLY TWO of these following strings according to your best analysis: ${reaction_emojis.join(", ")}. If you want to respond with more than one, just separate them with a space and nothing else.`
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
			"name": reaction_emojis[0],
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
					"content": systemMessage + pastMessages.map(msg => "User " + msg.user + " said (on " + new Date(1000 * msg.ts).toString() + "): " + msg.text).join("\n") + "\n Just so you know, it's currently " + new Date(Date.now()).toString()
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
		"name": reaction_emojis.includes(reaction) ? reaction : "error_web",
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
			"text": `You have already opted into the Chess Emojis bot's data collection! :${reaction_emojis[6]}:`
		});
		return;
	}

	await interaction.client.chat.postEphemeral({
		"channel": interaction.command.channel_id,
		"user": userId,
		"text": `You opted into the Chess Emoji bot's data collection!! :${reaction_emojis[0]}:`
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
			"text": `You have already opted into the Chess Emojis bot's reactions! :${reaction_emojis[6]}:`
		});
		return;
	}

	await interaction.client.chat.postEphemeral({
		"channel": interaction.command.channel_id,
		"user": userId,
		"text": `You opted into the Chess Emoji bot's reactions!! :${reaction_emojis[0]}: This also opts you into the bot's data collection.`
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
			"text": `You have already opted into the Chess Emojis bot's explanations! :${reaction_emojis[6]}:`
		});
		return;
	}

	await interaction.client.chat.postEphemeral({
		"channel": interaction.command.channel_id,
		"user": userId,
		"text": `You opted into the Chess Emoji bot's explanations!! :${reaction_emojis[0]}: This also opts you into the bot's reactions and data collection.`
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
			"text": `You opted out of the Chess Emoji bot's data collection. :${reaction_emojis[9]}: This also opts you out of the bot's reactions and explanations.`
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
		"text": `You can't opt out because you aren't opted into the Chess Emojis bot's data collection! :${reaction_emojis[7]}:`
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
			"text": `You opted out of the Chess Emoji bot's reactions. :${reaction_emojis[9]}: This also opts you out of the bot's explanations.`
		});
		optedIn.reactOptedIn.splice(optedIn.reactOptedIn.indexOf(userId), 1);
		if (optedIn.explanationOptedIn.includes(userId)) optedIn.explanationOptedIn.splice(optedIn.explanationOptedIn.indexOf(userId), 1);
		saveState(optedIn);
		return;
	}

	await interaction.client.chat.postEphemeral({
		"channel": interaction.command.channel_id,
		"user": userId,
		"text": `You can't opt out because you aren't opted into the Chess Emojis bot's reactions! :${reaction_emojis[7]}:`
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
			"text": `You opted out of the Chess Emoji bot's explanations. :${reaction_emojis[9]}:`
		});
		optedIn.explanationOptedIn.splice(optedIn.explanationOptedIn.indexOf(userId), 1);
		saveState(optedIn);
		return;
	}

	await interaction.client.chat.postEphemeral({
		"channel": interaction.command.channel_id,
		"user": userId,
		"text": `You can't opt out because you aren't opted into the Chess Emojis bot's explanations! :${reaction_emojis[7]}:`
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
							"text": "Secret Button :" + reaction_emojis[0] + ":"
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
					"text": `<@${body.user.id}> found the secret button :${reaction_emojis[0]}: Here it is again.`
				}
			},
			{
				"type": "actions",
				"elements": [
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": "Secret Button :" + reaction_emojis[0] + ":"
						},
						"action_id": "button_click"
					}
				]
			}
		],
		text: `<@${body.user.id}> found the secret button :${reaction_emojis[0]}: Here it is again.`,
		thread_ts: body.container.thread_ts || undefined
	});
});