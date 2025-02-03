const User = require('./models/User');
const System = require('./models/System');
const { sendErrorEmbed, sendResponseEmbed } = require('./messaging');
const { ApplicationCommandOptionType } = require('discord.js');

/**
 * Ověří, zda je option nastavená a má správný datový typ podle definice příkazu/subcommandu.
 * 
 * @param {Interaction} interaction - Interakce, která obsahuje požadované options.
 * @param {string} optionName - Název option, kterou kontrolujeme.
 * @returns {boolean} - True, pokud je option validní, jinak false.
 */
function isValidOption(interaction, optionName) {
    try {
        const subcmd = interaction.options.getSubcommand()
        const optdef = interaction.client.commands.get(subcmd).data.options.find(s=>s.name===subcmd).options.find(p=>p.name===optionName)
        const optval = interaction.options.get(optionName)

        if (!optdef) {
            console.log(`Option definition \`${optionName}\` nenalezena pro subcommand \`${subcommandName}\`.`);
            return false;
        }

        if (optdef.required && !optval) {
            console.log(`Option \`${optionName}\` je povinná pro subcommand \`${subcommandName}\`.`);
            return false;
        }

        const expectedType = optdef.type;
        if (optval && optval.type !== expectedType) {
            console.log(`Option \`${optionName}\` pro subcommand \`${subcommandName}\` má nesprávný typ! Očekávám ${ApplicationCommandOptionType[expectedType]}.`);
            return false;
        }
    } catch (error) {
        console.log(`Option: ${error}`)
    }
    return true;
}

/**
 * Ověří, zda jsou zadané všechny povinné parametry a zda jsou všechny zadané parametry platné
 * @param {Interaction} interaction 
 * @returns 
 */
function areValidOptions(interaction) {
    try {
        const subcmd = interaction.options.getSubcommand();
        const subcmdDef = interaction.client.commands.get(subcmd)

        if (!subcmdDef) {
            console.log(`Subcommand \`${subcmd}\` nenalezen.`);
            return false;
        }

        for (let optionDef of subcmdDef.data.options[0].options) {
            const optionName = optionDef.name;
            const optionValue = interaction.options.get(optionName);
            
            if (optionDef.required && !optionValue) {
                console.log(`Povinný parametr \`${optionName}\` nebyl zadán.`);
                return false;
            }

            const expectedType = optionDef.type;
            if (optionValue && optionValue.type !== expectedType) {
                console.log(`Parametr \`${optionName}\` má nesprávný typ! Očekávám typ: ${ApplicationCommandOptionType[expectedType]}.`);
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error(`Chyba při validaci parametrů: ${error}`);
        return false;
    }
}

async function setHomeSystem(interaction, systemSlug) {
    const userId = interaction.user.id;

    const system = await System.findOne({ systemSlug });
    if (!system) {
        sendErrorEmbed(interaction, "Systém nenalezen", `Systém se slugem \`${systemSlug}\` neexistuje.`);
        return null;
    }

    let user = await User.findOne({ userId });
    if (!user) {
        user = new User({ userId, homeSystemSlug: systemSlug });
    } else {
        user.homeSystemSlug = systemSlug;
    }

    await user.save();
    //sendResponseEmbed(message, "Domovský systém nastaven", `Tvůj domovský systém byl změněn na \`${systemSlug}\`.`);
    return system;
}

/**
 * Retrieves the user's home system from the database.
 * If the user has no home system set or it has been deleted, 
 * an error message is sent and `null` is returned.
 * 
 * @async
 * @param {Message} message - The Discord message from the user.
 * @returns {Promise<System|null>} Returns the home system if it exists, otherwise `null`.
 * 
 * @example
 * const homeSystem = await getHomeSystem(message);
 * if (homeSystem) {
 *     console.log(`User's home system: ${homeSystem.name}`);
 * }
 */
async function getHomeSystem(interaction) {
    const userId = interaction.user.id;
    const user = await User.findOne({ userId });

    if (!user || !user.homeSystemSlug) {
        sendErrorEmbed(interaction, "Žádný domovský systém", "Nemáš nastaven žádný domovský systém. Použij `/newt home <slug>`.");
        return null;
    }

    const system = await System.findOne({ systemSlug: user.homeSystemSlug });
    if (!system) {
        sendErrorEmbed(interaction, "Neplatný domovský systém", "Tvůj domovský systém byl pravděpodobně smazán. Nastav si nový pomocí `/newt home <slug>`.");
        return null;
    }

    return system;
}

module.exports = { setHomeSystem, getHomeSystem, isValidOption, areValidOptions };