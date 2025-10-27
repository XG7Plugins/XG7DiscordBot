import {Command} from "../../types/discord/Command";
import {GuildMember, PermissionFlagsBits, SlashCommandBuilder, TextChannel} from "discord.js";
import {closeTicket} from "../../repositories/tickets";

export default new Command({
    build() {
        return new SlashCommandBuilder()
            .setName("close-ticket")
            .setDescription("Fecha um ticket")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addChannelOption(option =>
                option.setName("canal")
                    .setDescription("Canal do ticket")
                    .setRequired(true)
            )
    },
    async run({interaction, options}): Promise<any> {

        if (!interaction.member) return

        if (!interaction.memberPermissions?.has("Administrator")) {
            return await interaction.reply({content: "Você não tem permissão para usar esse comando!"});
        }

        const channel = options.getChannel("canal") as TextChannel;

        await closeTicket(interaction, interaction.member as GuildMember, channel)

    }
})