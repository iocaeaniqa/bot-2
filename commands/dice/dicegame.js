const {
    Command
} = require("discord.js-commando");
const rules = require("../../rules");
const diceAPI = require("../../diceAPI");

module.exports = class DiceGame extends Command {
    constructor(client) {
        super(client, {
            name: "dice-game",
            group: "util",
            memberName: "dice-game",
            description: "Check a user's balance",
            aliases: ["game", "play", "play-game", "dice"],
            examples: ["dice 250 4"],
            args: [{
                key: "wager",
                prompt: "How much do you want to wager?",
                type: "string"
            }, {
                key: "multiplier",
                prompt: "How much do you want to multiply your wager by?",
                type: "string"
            }]
        });
    }

    run(msg, {
        wager,
        multiplier
    }) {
        // Multiplier checking
        if (multiplier < rules["minMultiplier"]) {
            return msg.reply(`❌ Your target multiplier must be at least \`${rules["minMultiplier"]}\`.`);
        } else if (multiplier > rules["maxMultiplier"]) {
            return msg.reply(`❌ Your target multiplier must be less than \`${rules["maxMultiplier"]}\`.`);
        }

        // Wager checking
        if (wager < rules["minWager"]) {
            return msg.reply(`❌ Your wager must be at least \`${rules["minWager"]}\` dots.`);
        } else if (wager > diceAPI.getBalance(rules["houseID"])) {
            return msg.reply(`❌ Your wager must be less than \`${diceAPI.getBalance(rules["houseID"])}\` dots.`);
        } else if (wager > diceAPI.getBalance(msg.author.id)) {
            return msg.reply(`❌ You need to have at least \`${wager}\`. Your balance is \`${diceAPI.getBalance(msg.author.id)}\`.`);
        }

        let success;
        let randomNumber = Math.random() * 100;

        success = (randomNumber < diceAPI.winPercentage(multiplier));
        
        // Take away the player's wager no matter what
        diceAPI.updateBalance(msg.author.id, diceAPI.getBalance(msg.author.id) - wager);
        // Give the wager to the house
        diceAPI.updateBalance(rules["houseID"], diceAPI.getBalance(rules["houseID"]) + wager);
        
        if (success === false) {
            return msg.reply(`❌ You lost \`${wager}\` dots. Your balance is now \`${diceAPI.getBalance(msg.author.id)}\`.`);
        } else {
            // Give the player their winnings
            diceAPI.updateBalance(msg.author.id, diceAPI.getBalance(msg.author.id) + (wager * multiplier));
            // Take the winnings from the house
            diceAPI.updateBalance(rules["houseID"], diceAPI.getBalance(rules["houseID"]) - (wager * multiplier));

            return msg.reply(`💰 You won \`${wager * multiplier}\` dots! Your balance is now \`${diceAPI.getBalance(msg.author.id)}\`.`);
        }

    }
};