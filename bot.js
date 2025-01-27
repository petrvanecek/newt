const { Client, Intents } = require('discord.js');
const mongoose = require('mongoose');

// Nastavení MongoDB
const mongoURI = 'tvůj-mongo-connection-string'; // Nahraď správným connection stringem
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.log(err));

// Vytvoření Discord bota
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.once('ready', () => {
  console.log(`Bot is ready as ${client.user.tag}`);
});

// Bot token
const token = 'tvůj-discord-bot-token'; // Nahraď správným tokenem
client.login(token);
