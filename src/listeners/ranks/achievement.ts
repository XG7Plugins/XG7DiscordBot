import {Listener} from "../../types/discord/Event";
import {client} from "../../index";
import {getOrCreateProfile} from "../../repositories/profile";
import {ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {getAchievement} from "../../types/database/models/Achievements";
import {generateAchievementImage} from "../../commands/profile/achievement";

export default new Listener({
    type: "interactionCreate",
    async handle(interaction): Promise<any> {

        if (!interaction.isButton()) return

        const id = interaction.customId;

        if (!id.startsWith("ach_")) return;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral});


        // Divide o ID em partes
        const [, pageStr] = id.split("_");
        const page = Number(pageStr);

        const guild = client.getMainGuild();

        if (!guild) return

        await guild.members.fetch();

        if (page < 0) {
            await interaction.editReply({content: "Página fora do limite!"});
            return;
        }

        try {
            const achievement = getAchievement(page)

            const user = interaction.user;

            if (user.bot) return;

            const member = guild.members.cache.get(user.id)
                || await guild.members.fetch(user.id).catch(() => null);

            if (!member) return;

            getOrCreateProfile(user.id).then(async profile => {

                if (!profile) return await interaction.editReply("Perfil não encontrado.");

                await generateAchievementImage(member, achievement, profile);

                const attachment = new AttachmentBuilder(`./src/assets/generated/achievement.png`);
                await interaction.message.edit({
                    content: "<@" + interaction.user.id + ">\nConquista: " + achievement.id,
                    files: [attachment],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setEmoji("⬅️")
                                    .setCustomId(`ach_${achievement.id - 1}`)
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setEmoji("➡️")
                                    .setCustomId(`ach_${achievement.id + 1}`)
                                    .setStyle(ButtonStyle.Primary)
                            )
                    ]
                });

                await interaction.editReply("Página alterada!")

            });
        } catch (e) {
            await interaction.editReply({content: "Página fora do limite!"});
            return;
        }




    }

})