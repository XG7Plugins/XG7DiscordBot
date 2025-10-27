import {SelectMenuHandler} from "../../types/discord/Components";
import {client, config} from "../../index";
import {MessageFlags, StringSelectMenuInteraction} from "discord.js";

export default class ColorHandler implements SelectMenuHandler {
    id = "select_color_role";
    async run(interaction: StringSelectMenuInteraction): Promise<void> {

        const selectedRoleId = interaction.values[0];

        const guild = client.getMainGuild();
        if (!guild) return;

        const member = await guild.members.fetch(interaction.user.id).catch(() => null);
        if (!member) return;

        const colorRoles: string[] = [
            ...config.colors.normal,
            ...config.colors.vip
        ];
        for (const roleId of colorRoles) {
            await member.roles.remove(roleId);
        }

        await member.roles.add("1431116471349805167");
        await member.roles.add(selectedRoleId);

        await interaction.reply({content: "Cor alterada com sucesso!", flags: MessageFlags.Ephemeral})

    }

}