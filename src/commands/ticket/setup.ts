import {Command} from "../../types/discord/Command";
import {MessageFlags, PermissionFlagsBits, SlashCommandBuilder, TextChannel} from "discord.js";
import {client, config} from "../../index";
import {SetupTicketComponent} from "../../components/template/ticket";

export default new Command({
    build() {
        return new SlashCommandBuilder()
            .setName("setup-ticket")
            .setDescription("Configura um canal de ticket")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    },
    async run({interaction}): Promise<any> {

        await interaction.deferReply({flags: [MessageFlags.Ephemeral]})

        if (!interaction.memberPermissions?.has("ModerateMembers")) {
            return await interaction.editReply({content: "Você não tem permissão para usar esse comando!"});
        }

        const channel = client.getMainGuild()?.channels.cache.get(config.channels.request_ticket_channel) as TextChannel;

        await channel.send({
            components: SetupTicketComponent(),
            flags: MessageFlags.IsComponentsV2,
        })

        await interaction.editReply({content: "Setup concluído com sucesso!"})
    }
})