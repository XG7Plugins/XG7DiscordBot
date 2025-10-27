import {Command} from "../../types/discord/Command";
import {EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {InteractionContextType} from "discord-api-types/v10";
import {getLevelInfo, getOrCreateProfile} from "../../repositories/profile";
import {saveTime} from "../../listeners/ranks/call";
import {client} from "../../index";

export default new Command({
    build() {
        return new SlashCommandBuilder()
            .setName("stats")
            .setDescription("Ve as estatísticas")
            .setContexts(InteractionContextType.Guild)
            .addUserOption(option =>
                option
                    .setName("user")
                    .setDescription("Usuário do rank")
                    .setRequired(false)
            )
    },
    run: async ({ interaction, options }) => {

        await interaction.deferReply();

        const guild = client.getMainGuild();

        if (!guild) return

        const user = options.getUser("user")?? interaction.user;

        if (user.bot) return;

        const member = guild.members.cache.get(user.id)
            || await guild.members.fetch(user.id).catch(() => null);

        if (!member) return;

        getOrCreateProfile(user.id).then(async profile => {

            if (!profile) return await interaction.editReply("Perfil não encontrado.");

            await saveTime(member, profile, false);


            let achivements = "";

            if (profile.profileAchievements.length === 0) {
                achivements = "Nenhuma ainda";
            } else {
                for (const ach of profile.profileAchievements) {
                    achivements += `• **${ach.achievement.name}**\n  \`${ach.achievement.description}\`\n  🗓️ ${ach.obtainedAt.toLocaleString("pt-BR")}\n\n`;
                }
            }

            const embed = new EmbedBuilder()
                .setTitle(`📊 Estatísticas de ${user.username}`)
                .setColor("Blue")
                .setThumbnail(user.displayAvatarURL())
                .addFields(
                    { name: "🆙 Nível", value: getLevelInfo(profile.xp).level.toString(), inline: true },
                    { name: "✨ XP", value: profile.xp.toString(), inline: true },
                    { name: "💬 Mensagens", value: profile.messages.toString(), inline: true },
                    { name: "🎮 Vitórias no Digit Game", value: profile.digitGameVictories.toString(), inline: true },
                    { name: "⏱️ Tempo em call", value: formatTime(profile.voiceTime), inline: true },
                    { name: "🏆 Conquistas", value: achivements, inline: false }
                )
                .setFooter({ text: "Estatísticas atualizadas recentemente" });


            await interaction.editReply({ embeds: [embed] });


        }).catch(err => {
            console.log(err);
        })

    }
});

function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = totalSeconds % 60;

    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;

    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;

    const days = Math.floor(totalHours / 24);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.join(' ') || '0s';
}

const timeInMillis = 90061000;
console.log(formatTime(timeInMillis));