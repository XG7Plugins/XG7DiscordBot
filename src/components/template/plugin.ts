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
import {Plugin} from "../../types/internet/Plugin";

export default function PluginComponent(plugin: Plugin) {
    const pluginTitle = new SectionBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# Plugin: " + plugin.name),
            new TextDisplayBuilder().setContent("***" + plugin.slogan + "***"),
            new TextDisplayBuilder().setContent("Criado em: " + formatDate(plugin.created) + "; Atualizado em: " + formatDate(plugin.updated))
        )
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(plugin.iconURL).setDescription("Plugin icon"))

    const pluginInfo = [
        new TextDisplayBuilder().setContent("ID: " + plugin.id),
        new TextDisplayBuilder().setContent("Versão: " + plugin.version),
        new TextDisplayBuilder().setContent("Downloads: " + plugin.downloads)
    ]
    const downloads = new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Baixe ele aqui: "))
        .setButtonAccessory(new ButtonBuilder().setURL("https://api.xg7plugins.com/plugins/download/" + plugin.id).setLabel("Download").setStyle(ButtonStyle.Link))

    const otherLinks = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("Github")
                .setURL(plugin.githubLink),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("Documentação")
                .setURL(plugin.docLink),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("Ver descrição")
                .setURL("http://xg7plugins.com/pt?plugin=" + plugin.id + "&tab=0"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("Ver Atualizações")
                .setURL("http://xg7plugins.com/pt?plugin=" + plugin.id + "&tab=3")
        )

    return new ContainerBuilder()
        .addSectionComponents(pluginTitle)
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(pluginInfo)
        .addSeparatorComponents(new SeparatorBuilder())
        .addSectionComponents(downloads)
        .addSeparatorComponents(new SeparatorBuilder())
        .addActionRowComponents(otherLinks)

}

function formatDate(date: Date | string): string {
    const dataObj = typeof date === 'string' ? new Date(date) : date;

    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    const horas = String(dataObj.getHours()).padStart(2, '0');
    const minutos = String(dataObj.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
}