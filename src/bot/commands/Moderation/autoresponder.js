const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const schema = require('../../../models/autoresponderModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoresponder')
    .setDescription('Manage auto responder.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) => subcommand.setName('add').setDescription('Add an autoresponse.').addStringOption(option => option.setName('trigger').setDescription('What triggers the auto response.').setRequired(true)).addStringOption(option => option.setName('response').setDescription('What the bot responsed with.').setRequired(true)))
    .addSubcommand((subcommand) => subcommand.setName('remove').setDescription("Remove an autoresponses.").addStringOption((option) => option.setName('trigger').setDescription('Remove the autoresponse by its triggers.').setRequired(true)))
    .addSubcommand((subcommand) => subcommand.setName('list').setDescription('List all auto responses.'))
    .addSubcommand((subcommand) => subcommand.setName('remove-all').setDescription('Remove all auto responses.')),
  async execute(interaction) {
    if (subcommand === 'add') {
      const subcommand = interaction.options.getString('trigger');
      const response = interaction.options.getString('response');

      const data = await schema.findOne({ guildId: interaction.guild.id });

      if (!data) {
        await schema.create({
          guildId: interaction.guild.id,
          autoresponses: [
            {
              trigger: trigger,
              reponse: response,
            }
          ]
        });

        const embed = new EmbedBuilder()
          .setTitle('Autoresponse Created')
          .setDescription(`Trigger:\n${trigger}\n\nResponse: ${response}`)
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else {
        const autoresponders = data.autoresponses;
        for (const t of autoresponders) {
          if (t.trigger === trigger)
            return await interaction.reply({ content: "You must have unique triggers." });
        }

        const addto = {
          trigger: trigger,
          response: response,
        }

        await schema.findOneAndDelete(
          { guildId: interaction.guild.id },
          { $push: { autoresponses: addto } }
        );

        const embed = new EmbedBuilder()
          .setTitle('Autoresponse Created')
          .setDescription(`Trigger:\n${trigger}\n\nResponse: ${response}`)
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } else if (subcommand === 'remove') {
      const trigger = interaction.options.getString('trigger');
      const data = await schema.findOne({
        guildId: interaction.guild.id,
        "autoresponses.trigger": trigger,
      });

      if(!data) {
        const embed = new EmbedBuilder()
        .setDescription(`I couldn't find an auto response with that trigger.`);

        await interaction.reply({ embeds: [embed] });
      } else {
        await schema.findOneAndDelete({ guildId: interaction.guild.id })
        const embed = new EmbedBuilder()
        .setDescription(`Auto response with trigger "${trigger}" removed.`);

        await interaction.reply({ embeds: [embed] });
      }
    } else if (subcommand === 'list') {
      const data = await schema.findOne({ guildId: interaction.guild.id });

      if(!data || !data.autoresponses || data.autoresponses.length === 0) {
        const embed = new EmbedBuilder()
        .setTitle('Autoresponse List')
        .setDescription('No autoresponses found.');

        await interaction.reply({ embeds: [embed] });
      } else {
        const embed1 = new EmbedBuilder()
        .setTitle('Autoresponse List')
        .setDescription(`List of all autoresponses.`);

        data.autoresponses.forEach((autoresponse, index) => {
          embed1.addFields({
            name: `Autoresponse #${index + 1}`,
            value: `Trigger: ${autoresponse.trigger}\nResponse: ${autoresponse.response}`,
          });
        });

        await interaction.reply({ embeds: [embed1] });
      }
    } else if (subcommand === 'remove-all') {
      const data = await schema.findOne({ Guild: interaction.guild.id });

      if(!data){
        const embed3 = new EmbedBuilder()
        .setDescription('No autoresponder find.');

        return await interaction.reply({ embeds: [embed3], ephemeral: true });
      } else {
        await schema.deleteMany({ Guild: interaction.guild.id });

        const embed2 = new EmbedBuilder()
        .setDescription(`Successfully deleted all responses.`);

        await interaction.reply({ embeds: [embed2] });
      }
    }
  },
};
