import {
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    SectionBuilder,
    SeparatorBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder
} from "discord.js";

export default function SiteComponent() {
    const thumbSection = new SectionBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# Site do XG7Plugins"),
            new TextDisplayBuilder().setContent("Conheça o site da XG7Plugins, as melhores opções de plugins para o seu servidor de Minecraft!"),
        )
        .setThumbnailAccessory(new ThumbnailBuilder().setURL("https://xg7plugins.com/images/logo.png").setDescription("BUIOFSDA"))
    const buttonSection = new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Entre no link: "))
        .setButtonAccessory(new ButtonBuilder().setURL("https://xg7plugins.com/").setLabel("XG7Plugins").setStyle(ButtonStyle.Link))

    return new ContainerBuilder()
        .addSectionComponents(thumbSection)
        .addSeparatorComponents(new SeparatorBuilder())
        .addSectionComponents(buttonSection);
}