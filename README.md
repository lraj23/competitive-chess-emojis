# Competitive Chess Emojis

### Main Purpose

The point of this bot is to analyze your conversations (though as of now, just each individual message) and react with an appropriate chess emoji for each message (brilliant, great, best, excellent, good, book, inaccuracy, mistake, missed win, blunder). Then, in games, you earn coins and go up the leaderboard, also using your coins for other things (not yet but maybe?). To do this, it uses an AI from OpenRouter (specifically openai/gpt-oss-20b:free).

### Commands

Since this bot sends all of your messages to an AI, and a lot of people probably don't like that, especially without consent or being notified, you can only get play the game if you opt in.

#### /ccemojis-data-opt-in
This command opts you in to the Competitive Chess Emojis bot's data collection. The bot will use the content of your messages as context of conversation to better react to other people's messages. The bot will not interact directly with you whatsoever.
#### /ccemojis-game-opt-in
This command opts you in to the Competitive Chess Emojis GAME!! This is the command to opt you in to most of everything. The bot will do the above AND also react to your messages with one or two chess emojis. This also allows you to play conversation games against other people. It ALSO *automatically* opts you in to data collection.
#### /ccemojis-explain-opt-in
This command opts you in to the Competitive Chess Emojis bot's explanations. The bot will do the above AND also send you a visible-only-to-you message with the AI's reasoning for your reaction. This also allows you to play conversation games against other people. It ALSO *automatically* opts you in to data collection AND the game.
#### /ccemojis-data-opt-out
This command opts you OUT of the Competitive Chess Emoji bot's data collection. The bot will *NO LONGER* use the content of your messages as context of conversation, so your data will NOT go to an AI. This also opts you out of conversation games and explanations.
#### /ccemojis-game-opt-out
This command opts you OUT of the Competitive Chess Emojis game! The bot will no longer react to your messages, and you will no longer be able to play conversation games. This also opts you out of explanations. However, you will stay opted in to data collection if you were opted in.
#### /ccemojis-explain-opt-out
This command opts you OUT of the Competitive Chess Emojis bot's explanations. The bot will no longer explain all your messages. However, you will stay opted in to data collection and the game if you were opted in.
#### /ccemojis-start-game
This command allows you start a conversation game against someone else. You and that person have to both be opted in to the game but not in any other active game, however. During the game, the bot will pay specific attention to that conversation, and messages in that conversation are worth some number of coins.
#### /ccemojis-resign-game
Unfortunately, this command is the ***only*** way to end a game. This game confirms you want to resign your game before ending your game, making you lose 6-7 coins for resigning.
#### /ccemojis-leaderboard
This command shows you the leaderboard of coins that each user has.
#### /ccemojis-help
This command helps you navigate this app better.

### Links, Channels, etc.

The dedicated channel for testing this bot is [#lraj23-bot-testing](https://hackclub.slack.com/archives/C09GR27104V). The GitHub repo is literally [right here](https://github.com/lraj23/competitive-chess-emojis). My Hackatime project for this bot is called competitive-chess-emojis.