import {
    ActionRowBuilder, ButtonBuilder,
    ButtonStyle
} from "discord.js";

export default function ImageRequestComponent() {
    return [
        new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("deny_image")
                    .setEmoji("❎")
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId("allow_image")
                    .setEmoji("✅")
                    .setStyle(ButtonStyle.Success),
            )
    ]
}