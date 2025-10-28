import {ButtonInteraction, MessageFlags} from "discord.js";
import {ButtonHandler} from "../../types/discord/Components";
import {client} from "../../index";

export default class DenyImage implements ButtonHandler {
    id = "deny_image";
    async run(interaction: ButtonInteraction): Promise<void> {

        const guild = client.getMainGuild();

        if (!guild) return

        const user = interaction.user;

        if (user.bot) return;

        const member = guild.members.cache.get(user.id)
            || await guild.members.fetch(user.id).catch(() => null);

        if (!member) return;

        if (!member.permissions.has("Administrator")) {
            await interaction.reply({
                content: "Você não tem permissão para desaprovar imagens!",
                flags: MessageFlags.Ephemeral
            })
            return
        }

        const attachment = interaction.message.attachments.first();

        if (!attachment) return;

        const filename = attachment.name;

        const memberID = filename.split("-")[1].replace(".jpg", "");

        guild.members.fetch(memberID).then(async member => {
            if (!member) return;

            await member.send({
                content: "Sua imagem foi rejeitada!",
                files: [attachment]
            })
            await interaction.message.delete();
        })
    }
}