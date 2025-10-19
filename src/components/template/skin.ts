import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    SectionBuilder,
    SeparatorBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder
} from "discord.js";

export default function SkinComponent(player: { name: string, id: string }) {
    const uuidSection = new SectionBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# Jogador: " + player.name),
            new TextDisplayBuilder().setContent("UUID: " + player.id)
        )
        .setThumbnailAccessory(new ThumbnailBuilder().setURL("https://crafatar.com/avatars/" + player.id + "?overlay=true").setDescription("Skin"))

    const download = new ButtonBuilder()
        .setURL("https://crafatar.com/skins/" + player.id)
        .setStyle(ButtonStyle.Link)
        .setLabel("Download")

    return new ContainerBuilder()
        .addSectionComponents(uuidSection)
        .addSeparatorComponents(new SeparatorBuilder())
        .addActionRowComponents(new ActionRowBuilder<ButtonBuilder>().setComponents(download))

}
