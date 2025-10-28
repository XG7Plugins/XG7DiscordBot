import {ButtonInteraction, MessageFlags} from "discord.js";
import {ButtonHandler} from "../../types/discord/Components";
import {getOrCreateProfile, updateProfile} from "../../repositories/profile";
import * as fs from "node:fs";
import {client} from "../../index";

export default class AllowImage implements ButtonHandler {
    id = "allow_image";
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
                content: "Você não tem permissão para aprovar imagens!",
                flags: MessageFlags.Ephemeral
            })
            return
        }

        const attachment = interaction.message.attachments.first();

        if (!attachment) return;


        const filename = attachment.name;
        const memberID = filename.split("-")[1].replace(".jpg", "");

        getOrCreateProfile(memberID).then(async profile => {

            if (!profile) {
                await interaction.reply({ content: "Perfil não encontrado!", flags: MessageFlags.Ephemeral });
                return;
            }

            const response = await fetch(attachment.url);

            if (!response.ok) {
                await interaction.reply({ content: "Erro ao baixar a imagem!", flags: MessageFlags.Ephemeral });
                return;
            }

            const buffer = Buffer.from(await response.arrayBuffer());

            const savePath = `./src/assets/images/profile_uploaded/${memberID}.jpg`;
            fs.writeFileSync(savePath, buffer);

            await interaction.reply({
                content: "Imagem aprovada com sucesso!",
                flags: [MessageFlags.Ephemeral]
            });

            setTimeout(async () => {
                await interaction.message.delete();
            }, 2000);

            profile.profileBgPath = savePath;

            await updateProfile(member.id, profile)

            guild.members.fetch(memberID).then(async member => {
                if (!member) return;

                await member.send({"content": "Sua imagem foi aprovada!", files: [attachment]})
            })

        }).catch(err => {
            console.error("Erro no getOrCreateProfile ou na execução:", err);
        });




    }
}