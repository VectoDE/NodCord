const { SlashCommandBuilder, EmbedBuilder, PermissionBitField } = require('discord.js');
const linkSchema = require('../../../models/antilinkModel');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('anti-link')
  .setDescription('Setup anti-link system for your server.')
  .addSubcommand(command => command.setName('setup').setDescription('Set up the anti link system to delete all links!').addStringOption(option => option.setName('permissions').setDescription('Choose the permissions who BYPASS the anti link system.').setRequired(true).addChoices(
    { name: 'Manage Channels', value: 'ManageChannels' },
    { name: 'Manage Channels', value: 'ManageGuild' },
    { name: 'Manage Channels', value: 'EmbedLinks' },
    { name: 'Manage Channels', value: 'AttachFiles' },
    { name: 'Manage Channels', value: 'ManageMessages' },
    { name: 'Manage Channels', value: 'Administrator' }
  )))
  .addSubcommand(command => command.setName('disable').setDescription('Disable the anti link system.'))
  .addSubcommand(command => command.setName('check').setDescription('Check the status of the anti link system.'))
  .addSubcommand(command => command.setName('edit').setDescription('Edit your anti link permissions.').addStringOption(option => option.setName('permissions').setDescription('Choose the permissions who BYPASS the anit link system.').setRequired(true).addChoices(
    { name: 'Manage Channels', value: 'ManageChannels' },
    { name: 'Manage Channels', value: 'ManageGuild' },
    { name: 'Manage Channels', value: 'EmbedLinks' },
    { name: 'Manage Channels', value: 'AttachFiles' },
    { name: 'Manage Channels', value: 'ManageMessages' },
    { name: 'Manage Channels', value: 'Administrator' }
  ))),
  async execute(interaction) {
    const { options } = interaction;

    if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: "You must have Administrator perms to use this command.", ephemeral: true });

    const sub = options.getSubcommand()

    switch(sub) {
      case 'setup':
        const permissions = options.getString('permissions');
        const Data = await linkSchema.findOne({ Guild: interaction.guild.id });

        if(Data) return await interaction.reply({ content: 'You already have the anti link system setup.' });

        if(!Data) {
          linkSchema.create({
            Guild: interaction.guild.id,
            Perms: permissions
          });
        }

        const embed = new EmbedBuilder()
        .setColor('Random')
        .setDescription(`Successfully setup anti link system with permissions **${permissions}**.`);

        await interaction.reply({ embeds: [embed] });
    }

    switch(sub) {
      case 'disable':
        await linkSchema.deleteMany();

        const embed2 = new EmbedBuilder()
        .setColor('Random')
        .setDescription(`Successfully disabled the anti link system.`);

        await interaction.reply({ embeds: [embed2] });
    }

    switch(sub) {
      case 'check':
        const Data = await linkSchema.findOne({ Guild: interaction.guild.id });

        if(!Data) return await interaction.reply({ content: 'The anti link system is currently disabled.' });

        const permissions = Data.Perms;

        if(!permissions) return await interaction.reply({ content: `There is no anti link system setup.` })
          else await interaction.reply({ content: `You anti link system is currently setup with permissions **${permissions}**.`, ephemeral: true });
    }

    switch(sub) {
      case 'edit':
        const Data = await linkSchema.findOne({ Guild: interaction.guild.id });
        const permissions = options.getString('permissions');
        if(!Data) return await interaction.reply({ content: 'You need to setup the anti link system first.' })
          else {
            await linkSchema.deleteMany();
            await linkSchema.create({
              Guild: interaction.guild.id,
              Perms: permissions
            });

            const embed3 = new EmbedBuilder()
            .setColor('Random')
            .setDescription(`You anti link BYPASS permissions has now been set to ${permissions}.`);

            await interaction.reply({ embeds: [embed3] });
          }
    }
  }
}
