import app from "./client.js";
import { getCCEmojis, logInteraction, saveState } from "./datahandler.js";
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
const lraj23BotTestingId = "C09GR27104V";
const lraj23UserId = "U0947SL6AKB";

app.message('', async ({ message }) => {
	const optedIn = getCCEmojis();
	if (!optedIn.reactOptedIn.includes(message.user)) {
		if (message.channel === lraj23BotTestingId) await app.client.chat.postEphemeral({
			channel: lraj23BotTestingId,
			user: message.user,
			blocks: [
				{
					"type": "section",
					"text": {
						"type": "mrkdwn",
						"text": `You aren't opted in to Competitive Chess Emojis! Opt in with /ccemojis-game-opt-in`
					}
				}
			],
			text: `You aren't opted in to Competitive Chess Emojis! Opt in with /ccemojis-game-opt-in`,
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

app.command('/ccemojis-data-opt-in', async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.payload.user_id;
	let CCEmojis = getCCEmojis();

	if (CCEmojis.dataOptedIn.includes(userId))
		return await interaction.respond(`You have already opted into the Competitive Chess Emojis bot's data collection! :${mainEmojis[8]}:`);

	await interaction.respond(`You opted into the Competitive Chess Emoji bot's data collection!! :${mainEmojis[4]}:`);
	CCEmojis.dataOptedIn.push(userId);
	saveState(CCEmojis);
});

app.command('/ccemojis-game-opt-in', async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.payload.user_id;
	let CCEmojis = getCCEmojis();

	if (CCEmojis.reactOptedIn.includes(userId))
		return await interaction.respond(`You have already opted into the Competitive Chess Emojis game! :${mainEmojis[8]}:`);

	await interaction.respond(`You opted into the Competitive Chess Emojis game!! :${sideEmojis[3]}: This also opts you into the bot's data collection.`);
	CCEmojis.reactOptedIn.push(userId);
	if (!CCEmojis.dataOptedIn.includes(userId)) CCEmojis.dataOptedIn.push(userId);
	saveState(CCEmojis);
});

app.command('/ccemojis-explain-opt-in', async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.payload.user_id;
	let CCEmojis = getCCEmojis();

	if (CCEmojis.explanationOptedIn.includes(userId))
		return await interaction.respond(`You have already opted into the Competitive Chess Emojis bot's explanations! :${mainEmojis[8]}:`);

	await interaction.respond(`You opted into the Competitive Chess Emoji bot's explanations!! :${mainEmojis[1]}: This also opts you into the game and data collection.`);
	CCEmojis.explanationOptedIn.push(userId);
	if (!CCEmojis.reactOptedIn.includes(userId)) CCEmojis.reactOptedIn.push(userId);
	if (!CCEmojis.dataOptedIn.includes(userId)) CCEmojis.dataOptedIn.push(userId);
	saveState(CCEmojis);
});

app.command('/ccemojis-data-opt-out', async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.payload.user_id;
	let CCEmojis = getCCEmojis();

	if (CCEmojis.dataOptedIn.includes(userId)) {
		await interaction.respond(`You opted out of the Competitive Chess Emoji bot's data collection. :${mainEmojis[9]}: This also opts you out of the game and explanations.`);
		CCEmojis.dataOptedIn.splice(CCEmojis.dataOptedIn.indexOf(userId), 1);
		if (CCEmojis.reactOptedIn.includes(userId)) CCEmojis.reactOptedIn.splice(CCEmojis.reactOptedIn.indexOf(userId), 1);
		if (CCEmojis.explanationOptedIn.includes(userId)) CCEmojis.explanationOptedIn.splice(CCEmojis.explanationOptedIn.indexOf(userId), 1);
		saveState(CCEmojis);
		return;
	}

	await interaction.respond(`You can't opt out because you aren't opted into the Competitive Chess Emojis bot's data collection! :${sideEmojis[4]}:`);
});

app.command('/ccemojis-game-opt-out', async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.payload.user_id;
	let CCEmojis = getCCEmojis();

	if (CCEmojis.reactOptedIn.includes(userId)) {
		await interaction.respond(`You opted out of the Competitive Chess Emojis game. :${sideEmojis[0]}: This also opts you out of the bot's explanations.`);
		CCEmojis.reactOptedIn.splice(CCEmojis.reactOptedIn.indexOf(userId), 1);
		if (CCEmojis.explanationOptedIn.includes(userId)) CCEmojis.explanationOptedIn.splice(CCEmojis.explanationOptedIn.indexOf(userId), 1);
		saveState(CCEmojis);
		return;
	}

	await interaction.respond(`You can't opt out because you aren't opted into the Competitive Chess Emojis game! :${sideEmojis[4]}:`);
});

app.command('/ccemojis-explain-opt-out', async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.payload.user_id;
	let CCEmojis = getCCEmojis();

	if (CCEmojis.explanationOptedIn.includes(userId)) {
		await interaction.respond(`You opted out of the Competitive Chess Emoji bot's explanations. :${mainEmojis[11]}:`);
		CCEmojis.explanationOptedIn.splice(CCEmojis.explanationOptedIn.indexOf(userId), 1);
		saveState(CCEmojis);
		return;
	}

	await interaction.respond(`You can't opt out because you aren't opted into the Competitive Chess Emojis bot's explanations! :${sideEmojis[4]}:`);
});

app.command('/ccemojis-start-game', async interaction => {
	await interaction.ack();
	let CCEmojis = getCCEmojis();
	let userId = interaction.payload.user_id;
	if (!CCEmojis.reactOptedIn.includes(userId))
		return await interaction.respond(`You aren't opted into the Competitive Chess Emojis game! :${mainEmojis[11]}: Opt in first with /ccemojis-game-opt-in before trying to play!`);
	if (!CCEmojis.conversations.map(convo => [convo.white, convo.black]).flat().reduce((product, id) => product * (+!(id === userId)), 1))
		return await interaction.respond(`You can't start a game if you are currently in a game! If you finished your last game already, try running <command that doesn't work yet> and trying again.`);
	await interaction.client.chat.postEphemeral({
		"channel": interaction.command.channel_id,
		"user": userId,
		"blocks": [
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": `Choose someone to play against:`
				},
				"accessory": {
					"type": "users_select",
					"placeholder": {
						"type": "plain_text",
						"text": "Default: yourself",
						"emoji": true
					},
					"action_id": "ignore-start-black"
				},
			},
			{
				"type": "actions",
				"elements": [
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": ":x: Cancel",
							"emoji": true
						},
						"value": "cancel",
						"action_id": "cancel"
					},
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": ":white_check_mark: Go!",
							"emoji": true
						},
						"value": "confirm",
						"action_id": "confirm"
					}
				]
			}
		],
		"text": `Choose someone to play against:`
	});
});

app.action(/^ignore-.+$/, async interaction => await interaction.ack());

app.action('cancel', async interaction => [await interaction.ack(), await interaction.respond({ "delete_original": true })]);

const getValues = interaction => {
	console.log(Object.entries(Object.values(interaction.body.state.values)[0])[0][0]);
	return Object.fromEntries(Object.values(interaction.body.state.values).map(inputInfo => [(key => key[key.length - 1])(Object.entries(inputInfo)[0][0].split("-")), (input => ("selected_option" in input) ? input.selected_option?.value : (input || input))(Object.entries(inputInfo)[0][1])]));
}

app.action('confirm', async interaction => {
	await interaction.ack();
	let CCEmojis = getCCEmojis();
	let whiteId = interaction.body.user.id;
	console.log(interaction.body.state.values);
	console.log(getValues(interaction));
	let blackId = interaction.body.state.values[Object.keys(interaction.body.state.values)[0]]["ignore-start-black"].selected_user || whiteId;
	let response = `<@${whiteId}>`;

	if (!CCEmojis.conversations.map(convo => [convo.white, convo.black]).flat().reduce((product, id) => product * (+!(id === blackId)), 1))
		return await interaction.respond(`You can't start a game if <@${blackId}> is currently in a game! Try asking <@${blackId}> if they are done with their game.`);

	if (!CCEmojis.reactOptedIn.includes(blackId)) {
		await interaction.respond(`<@${blackId}> isn't opted into the Competitive Chess Emojis game! They need to opt in first with /ccemojis-game-opt-in before they can play!`);
		// if (whiteId === lraj23UserId)
		// await app.client.chat.postEphemeral({
		// 	channel: blackId,
		// 	user: blackId,
		// 	text: `<@${whiteId}> tried to start a Competitive Chess Emojis game against you, but you aren't opted in. If you want to play, run /ccemojis-game-opt-in in <#${lraj23BotTestingId}> and challenge them back. If you don't want to receive this message again, try telling <@${whiteId}> that you don't want to play against them. (I will eventually make a button to opt out of game requests - lraj23, bot developer.)`
		// });
		return;
	}

	CCEmojis.conversations.push({
		white: whiteId,
		black: blackId,
		initiated: Date.now(),
		messages: []
	});
	await interaction.respond(`<@${whiteId}> has started a game against <@${blackId}>. You are playing as White!`);
	await app.client.chat.postMessage({
		channel: blackId,
		text: `<@${whiteId}> has started a Competitive Chess Emojis game against you in <#${interaction.body.channel.id}>. Head over there now to talk to them and earn some :siege-coin:! You are playing as Black.`
	});
	saveState(CCEmojis);
});

app.message(/secret button/i, async ({ message, say }) => {
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