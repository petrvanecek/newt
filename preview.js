const { sendErrorEmbed, sendResponseEmbed, sendInfoEmbed, sendEmbed } = require('./messaging.js');
const { SlashCommandBuilder, Interaction, AttachmentBuilder } = require('discord.js');
const { createCanvas } = require('canvas');
const System = require('./models/System');
const Body = require('./models/body');

const fs = require('fs');
const path = require('path');

function getBodyList(bodies) {
    return bodies.map(body => 
        new Body(
            body.planetName, 
            body.params[0], body.params[1],  // x, y
            body.params[2], body.params[3],  // vx, vy
            body.params[4], body.params[5],  // mass, radius
            body.params[6], body.params[7], body.params[8]  // r, g, b
        )
    );
}

function getPreviewUrlData(bodies) {
    const bodiesArray = bodies.map(body => [
        body.planetName, 
        body.params[0], 
        body.params[1], 
        body.params[2], 
        body.params[3], 
        body.params[4], 
        body.params[5], 
        body.params[6], 
        body.params[7], 
        body.params[8]
    ]);
    return JSON.stringify(bodiesArray)
}

async function updatePreview(bodies, embed, progressMessage) {
    for (let i = 1000; i < 5000; i += 1000) {

        let imageUrl = await generatePreview(bodies, i); // Funkce pro generování obrázku

        let attachment = new AttachmentBuilder(imageUrl, { name: 'preview.png' });
        embed.setImage('attachment://preview.png');

        await progressMessage.edit({
            embeds: [embed],
            files: [attachment]
        });
    }
}

function generatePreview(bodies, days = 100) {
    const bodiesList = getBodyList(bodies)

    const minsize = 400
    const scaleFactor = Math.max(0.0001, 1.2*Math.max(...bodiesList.flatMap(body => [Math.abs(body.x), Math.abs(body.y)]))/100)
    const canvas = createCanvas(minsize, minsize);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, minsize, minsize);
    ctx.translate(minsize/2,minsize/2)
    ctx.scale(minsize/200/scaleFactor,minsize/200/scaleFactor)


    for (let t=0; t<days; t++) {
        /*ctx.fillStyle = 'rgba(0,0,0,0.01)';
        ctx.fillRect(-100*scaleFactor,-100*scaleFactor, 200*scaleFactor, 200*scaleFactor);*/
        for(let s=0; s<1000; s++)
            Body.simulate(bodiesList)
        for (let b = 0; b < bodiesList.length; ++b) {
            ctx.beginPath()                     
            let minradius = Math.max(bodiesList[b].r / 2, 1/(minsize/200/scaleFactor))
            ctx.arc(bodiesList[b].x, bodiesList[b].y, minradius, 0, 2 * Math.PI);
            ctx.fillStyle = `rgba(${bodiesList[b].colorR}, ${bodiesList[b].colorG}, ${bodiesList[b].colorB}, ${0.01 + Math.pow(t/(days+0.0),10)})`
            ctx.fill()
        }
    }

    // Uložení do bufferu
    const buffer = canvas.toBuffer('image/png');

    return buffer;
}

module.exports = { generatePreview, getPreviewUrlData, updatePreview };