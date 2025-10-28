import {Listener} from "../../types/discord/Event";
import {client} from "../../index";
import {getOrCreateProfile} from "../../repositories/profile";
import {ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {generateAchievementImage} from "../../commands/profile/achievement";

export default new Listener({
    type: "interactionCreate",
    async handle(interaction): Promise<any> {

        if (!interaction.isButton()) return

        const id = interaction.customId;

        if (!id.startsWith("achpf_")) return;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral});


        // Divide o ID em partes
        const [, memberID, indexStr] = id.split("_");
        const index = Number(indexStr);

        const guild = client.getMainGuild();

        if (!guild) return

        await guild.members.fetch();

        const member = guild.members.cache.get(memberID)

        if (!member) return;

        try {

            getOrCreateProfile(member.id).then(async profile => {

                if (!profile) return await interaction.editReply("Perfil não encontrado.");

                if (index < 0 || index >= profile?.profileAchievements.length) {
                    await interaction.editReply({content: "Página fora do limite!"});
                    return;
                }

                const achievement = profile.profileAchievements[index].achievement;

                await generateAchievementImage(member, achievement, profile);

                const attachment = new AttachmentBuilder(`./src/assets/generated/achievement.png`);
                await interaction.message.edit({
                    content: "<@" + interaction.user.id + ">\nConquistas de: " + member.user.username,
                    files: [attachment],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setEmoji("⬅️")
                                    .setCustomId(`achpf_${member.id}_${index-1}`)
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setEmoji("➡️")
                                    .setCustomId(`achpf_${member.id}_${index+1}`)
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