import {Command} from "../../types/discord/Command";
import {MessageFlags, PermissionFlagsBits, SlashCommandBuilder, TextChannel} from "discord.js";
import {client, config} from "../../index";
import ColorComponent from "../../components/template/color";

export default new Command({
    build() {
        return new SlashCommandBuilder()
            .setName("setup-color")
            .setDescription("Configura um canal de cores")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    },
    async run({interaction}): Promise<any> {

        await interaction.deferReply({flags: [MessageFlags.Ephemeral]})

        if (!interaction.memberPermissions?.has("Administrator")) {
            return await interaction.editReply({content: "Você não tem permissão para usar esse comando!"});
        }

        const channel = client.getMainGuild()?.channels.cache.get(config.channels.color_channel) as TextChannel;
        const vipChannel = client.getMainGuild()?.channels.cache.get(config.channels.vip_color_channel) as TextChannel;

        await channel.send({
            components: ColorComponent(config.colors.normal),
            flags: MessageFlags.IsComponentsV2,
        })

        await vipChannel.send({
            components: ColorComponent(config.colors.vip),
            flags: MessageFlags.IsComponentsV2,
        })

        await interaction.editReply({content: "Setup concluído com sucesso!"})
    }
})