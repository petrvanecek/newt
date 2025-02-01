const User = require('./models/User');
const System = require('./models/System');
const { sendErrorEmbed, sendResponseEmbed } = require('./messaging');

async function setHomeSystem(message, systemSlug) {
    const userId = message.author.id;

    const system = await System.findOne({ systemSlug });
    if (!system) {
        sendErrorEmbed(message, "Systém nenalezen", `Systém se slugem \`${systemSlug}\` neexistuje.`);
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
async function getHomeSystem(message) {
    const userId = message.author.id;
    const user = await User.findOne({ userId });

    if (!user || !user.homeSystemSlug) {
        sendErrorEmbed(message, "Žádný domovský systém", "Nemáš nastaven žádný domovský systém. Použij `/newt home <slug>`.");
        return null;
    }

    const system = await System.findOne({ systemSlug: user.homeSystemSlug });
    if (!system) {
        sendErrorEmbed(message, "Neplatný domovský systém", "Tvůj domovský systém byl pravděpodobně smazán. Nastav si nový pomocí `/newt home <slug>`.");
        return null;
    }

    return system;
}

module.exports = { setHomeSystem, getHomeSystem };