import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    MediaGalleryBuilder,
    SeparatorBuilder,
    TextDisplayBuilder
} from "discord.js";
import {MediaGalleryItemBuilder} from "@discordjs/builders";

export default function TopComponent(pageNumber: number, maxPage: number, type: "messages" | "xp" | "voice" | "digit") {

    const title =
        type === "messages" ? "## 🗨️ TOP 10 de mensagens"
            : type === "xp" ? "## 💎 TOP 10 de XP" :
            type === "digit" ? "## 🏆 TOP 10 de tempo em call acumulado"
                : "## 🗣️ TOP 10 de tempo em call acumulado";

    return new ContainerBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(title),
            new TextDisplayBuilder().setContent("Página: " + pageNumber + "/" + maxPage)
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addMediaGalleryComponents(
            new MediaGalleryBuilder()
                .addItems(new MediaGalleryItemBuilder().setURL("attachment://top.png"))
        )
        .addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setEmoji("⬅️")
                        .setCustomId(`top_${type}_${pageNumber - 1}`)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setEmoji("➡️")
                        .setCustomId(`top_${type}_${pageNumber + 1}`)
                        .setStyle(ButtonStyle.Primary)
                )
        )
}