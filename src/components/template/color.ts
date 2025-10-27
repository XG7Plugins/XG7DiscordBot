import {client} from "../../index";
import {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    TextDisplayBuilder
} from "discord.js";

export default function ColorComponent(roles: string[]) {
    const guild = client.getMainGuild();
    if (!guild) return [new TextDisplayBuilder().setContent("Ocorreu um erro!")];

    const options = roles
        .map(id => guild.roles.cache.get(id))
        .filter(role => !!role)
        .map(role =>
            new StringSelectMenuOptionBuilder()
                .setLabel(role!.name)
                .setValue(role!.id)
                .setDescription(`Cor: ${role?.name} *${role!.hexColor}*`)
                .setEmoji("🎨")
        );

    if (options.length === 0) return [new TextDisplayBuilder().setContent("Ocorreu um erro!")];

    const select = new StringSelectMenuBuilder()
        .setCustomId("select_color_role")
        .setPlaceholder("🎨 Selecione uma cor de cargo")
        .addOptions(options);

    return [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)];
}