const { sendErrorEmbed, sendResponseEmbed, sendInfoEmbed, sendEmbed } = require('./messaging');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');
require('dotenv').config({path: '../.env'});

const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected!'))
    .catch(err => console.log(err));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,    // Pro zprávy v textových kanálech
    GatewayIntentBits.MessageContent ] });
const token =  process.env.DISCORD_TOKEN; 
client.login(token);
    
client.commands = new Collection();
//const commands = [];
// Načítání příkazů
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

let newtCommand = new SlashCommandBuilder()
    .setName('newt')
    .setDescription('Interacts with the planetary system');

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    // Přidáme subcommandy
    if (command.data.name === 'newt') {
        command.data.options.forEach(subcommand => {
            newtCommand.addSubcommand(subcommand);
            client.commands.set(subcommand.name, command);
            console.log(`✅ Loaded command: ${command.data.name}/${subcommand.name}`);
        });
    } else {        
        client.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
    }

}

//commands.push(newtCommand.toJSON());

// Registrace příkazů na Discord API
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: [newtCommand.toJSON()] })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);

// Event pro zpracování interakcí
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const subcommand = interaction.options.getSubcommand();
    const command = client.commands.get(subcommand);
    if (command) {
        try {
            await command.execute(interaction);  
        } catch (error) {
            console.error(error);
            await sendErrorEmbed(interaction, `Něco se posralo 🤷‍♀️`, error)
        }
    } else {
        await sendErrorEmbed(interaction, `Tenhle příkaz neznám`, "Ale možná by stálo za to se ho naučit. Co by měl dělat?")
    }
});

client.on('ready', async () => {
    console.log(`✅ Přihlášen jako ${client.user.tag}`);

    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        console.error("❌ Nepodařilo se najít server!");
        return;
    }

    const command = await guild.commands.fetch('1335302361127587950'); // ID hlavního příkazu
    console.log("📋 Sub-commandy:", command.options?.map(opt => opt.name));
});


/*client.on('ready', async () => {
    console.log(`✅ Přihlášen jako ${client.user.tag}`);

    const guildId = 'TVŮJ_SERVER_ID'; // ID serveru, kde testuješ
    const guild = client.guilds.cache.get(guildId);
    
    if (!guild) {
        console.error("❌ Nepodařilo se najít server!");
        return;
    }

    await guild.commands.set([...tvé_příkazy]); // Registrace příkazů na server
    console.log("✅ Příkazy úspěšně registrovány pro GUILD.");
});


/*client.on('ready', async () => {
    console.log("🔍 Kontroluji registrované příkazy...");

    const commands = await client.application.commands.fetch();
    console.log(commands.map(cmd => `${cmd.name} (${cmd.id})`));

    const newtCommand = commands.find(cmd => cmd.name === 'newt');
    if (newtCommand) {
        console.log(`🔍 Subcommands for /newt: ${JSON.stringify(newtCommand.options, null, 2)}`);
    } else {
        console.log("⚠️ /newt nebyl nalezen mezi registrovanými příkazy!");
    }
});

/*client.on('messageCreate', async message => {
    if (message.content.startsWith('/newt')) {
        await help(message, 'help');
    }
});*/

/**
 * Prints help for known commands.
 * @param {Message} message 
 * @param {Array<String>} args 
 */
/*async function help(message, args) {
    console.log(args)
    if (args.length === 1 || args[1] === 'help') {
        color = '#0000FF'
        title = 'Nápověda pro /newt'
    } else {
        color = '#FF0000'
        title = 'Neznámý příkaz'
    }

    let description = "**Dostupné příkazy:**\n";

    Array.from(client.commands.values()).sort((a,b)=>a.data.order - b.data.order).forEach(command => {
        description += `- \`${command.data.usage}\`\n  ${command.data.description}\n`
    });

    await sendEmbed(message, color, title, description)
}

*/

/*const fs = require("fs");
const path = require("path");
require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder, Collection, Message } = require('discord.js');
const mongoose = require('mongoose');
const User = require('./models/User');
const System = require('./models/System');
const Body = require('./models/body');
const { generatePreview } = require('./preview');
const { sendErrorEmbed, sendResponseEmbed, sendInfoEmbed, sendEmbed } = require('./messaging');
const { getHomeSystem,setHomeSystem } = require('./utils');
*/
/*// Setup MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected!'))
    .catch(err => console.log(err));

// Create Discord Bot
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', () => {
    console.log(`Bot is ready as ${client.user.tag}`);
});

// Loads all available commands
const token =  process.env.DISCORD_TOKEN; 
client.login(token);

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
        console.warn(`⚠️ Skipping invalid command file: ${file}`);
    }
}


client.on('messageCreate', async message => {
    if (message.content.startsWith('/newt')) {
        const args = message.content.trim().match(/"([^"]+)"|(\S+)/g).map(arg => arg.replace(/"/g, ''));
        let command = client.commands.get(args[1]);
        if (!command) {
            await help(message, args);
        } else {
            await command.execute(message, args);
        }
    }
});

/**
 * Prints help for known commands.
 * @param {Message} message 
 * @param {Array<String>} args 
 */
/*async function help(message, args) {
    console.log(args)
    if (args.length === 1 || args[1] === 'help') {
        color = '#0000FF'
        title = 'Nápověda pro /newt'
    } else {
        color = '#FF0000'
        title = 'Neznámý příkaz'
    }

    let description = "**Dostupné příkazy:**\n";

    Array.from(client.commands.values()).sort((a,b)=>a.data.order - b.data.order).forEach(command => {
        description += `- \`${command.data.usage}\`\n  ${command.data.description}\n`
    });

    await sendEmbed(message, color, title, description)
}

/*
- \`zatím neumí /newt delete <planetName>\`\n  odstraní planetu ze systému\n
- \`zatím neumí /newt modify <planetName> <x> <y> <vx> <vy> <r> <mass> <colorR> <colorG> <colorB>\`\n  upraví vlastnosti planetárního tělesa\n
- \`/newt list <systems|bodies>\`\n  zobrazí seznam všech systémů\n
- \`zatím neumí /newt versions <system-id>\`\n  zobrazí historii systému\n
- \`zatím neumí /newt fork <system-id> <version> <nový název>\`\n  vytvoří kopii dané verze systému pod novým jménem\n
`)
/*
async function modifyCommand(message) {
  try {    
    const argsString = message.content.replace('/newt add ', '').trim();
    const args = argsString.match(/"([^"]+)"|(\S+)/g).map(arg => arg.replace(/"/g, ''));

    if(args.length != 13) {
      await sendErrorEmbed(message, "Chybné parametry", '```/newt modify <id-systému> <název tělesa> x y vx vy mass radius r g b```')
      return
    }

    const systemSlug = args[2];       
    const system = await System.findOne( { systemSlug } );

    if (!system) {
      sendErrorEmbed(message, `Systém "${systemSlug}" neexistuje`, 'Nechceš se podívat, jaké systémy tu vlastně jsou? \n\n```/newt list```\nNebo se možná podívat, co dalšího lze dělat: ```/newt help```')
      return
    }

  } catch (error) {
    await sendResponseEmbed(message,`Něco se nepovedlo`, error.text)
  }
}

*/
