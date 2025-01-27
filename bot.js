const { Client, Intents } = require('discord.js');
const mongoose = require('mongoose');

// Nastavení MongoDB
const mongoURI = 'tvůj-mongo-connection-string'; // Nahraď správným connection stringem
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.log(err));

// Vytvoření Discord bota
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once('ready', () => {
  console.log(`Bot is ready as ${client.user.tag}`);
});

// Bot token
const token =  process.env.DISCORD_TOKEN; // Nahraď správným tokenem
client.login(token);

const System = require('./models/System');

client.on('messageCreate', async message => {
  if (message.content.startsWith('/newt create')) {
    const systemName = message.content.replace('/newt create ', '').trim();
    const newSystem = new System({
      name: systemName,
      bodies: [],
      version_history: [],
    });
    
    await newSystem.save();
    message.reply(`Nový planetární systém "${systemName}" byl vytvořen s ID ${newSystem._id}`);
  }
});
