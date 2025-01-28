require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');

// Nastavení MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.log(err));

// Vytvoření Discord bota
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', () => {
  console.log(`Bot is ready as ${client.user.tag}`);
});

const token =  process.env.DISCORD_TOKEN; 
client.login(token);

const System = require('./models/System');

client.on('messageCreate', async message => {
  console.log(`incomming message: ${message.content}`);
  if (message.content.startsWith('/newt create')) {
    console.log('creating system');
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