/*
Copyright 2018 Jonah Snider

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const { Command } = require('discord.js-commando');
const rp = require('request-promise-native');
const logger = require('../../providers/logger').scope('command', 'day facts');

module.exports = class DayFactsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'day-facts',
      group: 'fun',
      memberName: 'day-facts',
      description: 'Get a fact about a day.',
      details: 'Not specifying the day to lookup will give you a random fact',
      aliases: ['day-fact', 'random-day-facts', 'random-day-fact'],
      examples: ['day-facts', 'day-facts 14'],
      args: [{
        key: 'day',
        prompt: 'What day do you want to get facts for?',
        type: 'integer',
        min: 1,
        max: 31,
        default: 'random'
      }],
      throttling: {
        usages: 2,
        duration: 6
      }
    });
  }

  run(msg, { day }) {
    try {
      msg.channel.startTyping();

      const options = { uri: `http://numbersapi.com/${day}/date` };

      rp(options)
        .then(result => msg.reply(result))
        .catch(err => {
          logger.error(err);
          return msg.reply('There was an error with the API we use (http://numbersapi.com)');
        });
    } finally {
      msg.channel.stopTyping();
    }
  }
};
