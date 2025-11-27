import {Command} from "../../types/discord/Command";
import {MessageFlags, PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {InteractionContextType} from "discord-api-types/v10";
import {awardAchievementToProfile} from "../../repositories/profile_achievements";
import {client} from "../../index";
import {getOrCreateProfile} from "../../repositories/profile";
import {AchievementID, getAchievement} from "../../types/database/models/Achievements";

export default new Command({
    build() {
        return new SlashCommandBuilder()
            .setName("vip")
            .setDescription("Da um VIP para um usuário")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setContexts(InteractionContextType.Guild)
            .addUserOption(option =>
                option
                    .setName("user")
                    .setDescription("Usuário a receber a conquista de VIP")
                    .setRequired(true)
            )

    },
    run: async ({ interaction, options }) => {

        await interaction.deferReply({flags: [MessageFlags.Ephemeral]})

        if (!interaction.memberPermissions?.has("Administrator")) {
            return await interaction.editReply({content: "Você não tem permissão para usar esse comando!"});
        }

        const user = options.getUser("user", true);

        if (user.bot) return

        const member = await client.getMainGuild()?.members.fetch(user.id).catch(() => null);
        if (!member) return interaction.editReply("Usuário não está no servidor.");

        getOrCreateProfile(member.id).then(async profile => {
            if (!profile) return interaction.editReply("Perfil não encontrado.");

            await awardAchievementToProfile(member, undefined, profile, getAchievement(AchievementID.VIP))

            return interaction.editReply(`Conquista de VIP concedida para ${member.user.username}!`);
        })

    }
});