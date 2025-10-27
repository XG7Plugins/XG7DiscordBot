import {Command} from "../../types/discord/Command";
import {AttachmentBuilder, GuildMember, SlashCommandBuilder} from "discord.js";
import {InteractionContextType} from "discord-api-types/v10";
import ProfileRepository, {getLevelInfo, getOrCreateProfile} from "../../repositories/profile";
import {saveTime} from "../../listeners/ranks/call";
import {client, config, database} from "../../index";
import { createCanvas, loadImage, registerFont } from "canvas";
import { writeFileSync } from "fs";
import {Profile} from "../../types/database/models/Profile";

export default new Command({
    build() {
        return new SlashCommandBuilder()
            .setName("rank")
            .setDescription("Ve o seu nível")
            .setContexts(InteractionContextType.Guild)
            .addUserOption(option =>
                option
                    .setName("user")
                    .setDescription("Usuário do rank")
                    .setRequired(false)
            )
    },
    run: async ({ interaction, options }) => {

        const guild = client.getMainGuild();

        if (!guild) return

        const user = options.getUser("user")?? interaction.user;

        if (user.bot) return;

        const member = guild.members.cache.get(user.id)
            || await guild.members.fetch(user.id).catch(() => null);

        if (!member) return;

        getOrCreateProfile(user.id).then(async profile => {

            if (!profile) return await interaction.reply("Perfil não encontrado.");

            await saveTime(member, profile, false);

            await generateImage(member, profile);

            const attachment = new AttachmentBuilder("./src/assets/generated/rank.png");
            await interaction.reply({ content: "<@" + interaction.user.id + ">", files: [attachment] });


        }).catch(err => {
            console.log(err);
        })

    }
});

/**
 * Gera imagem de perfil (rank card)
 */
export async function generateImage(member: GuildMember, profile: Profile) {

    const {level, xpForNextLevel} = getLevelInfo(profile.xp);

    const guild = client.getMainGuild();

    if (!guild) return;

    const repo = database.repositories.get("profiles") as ProfileRepository;
    if (!repo) return;

    const leaderboardPos = await repo.getUserPosition(profile.id);

    const bg = await loadImage("./src/assets/images/rank_bg.png");
    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");

    registerFont('./src/assets/font/Bauhaus.ttf', { family: 'Bauhaus' });

    // Fundo
    ctx.drawImage(bg, 0, 0);

    // ====== FOTO DO USUÁRIO ======
    const avatar = await loadImage(member.displayAvatarURL({ extension: "png", size: 256 }));
    const avatarSize = 170;
    const avatarX = 163.45;
    const avatarY = 124.5;
    ctx.save();

    const radius = 20;
    ctx.beginPath();
    ctx.roundRect(avatarX - avatarSize/2, avatarY - avatarSize/2, avatarSize, avatarSize, radius);
    ctx.clip();

    ctx.drawImage(
        avatar,
        avatarX - avatarSize / 2 ,
        avatarY - avatarSize / 2 ,
        avatarSize,
        avatarSize
    );
    ctx.restore();

    // ====== LEVEL ======

    const lvlX = 163.45
    const lvlY = 260.5

    ctx.textAlign = "center";
    ctx.font = "bold 32px Bauhaus";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Nível: ${level}`, lvlX, lvlY);


    // ====== RANK ======
    const rankX = 859.64
    const rankY = 75

    ctx.textAlign = "center";
    ctx.font = "bold 52px Bauhaus";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`#${leaderboardPos.position}`, rankX, rankY);

    // ====== NOME ======

    const colorRoles: string[] = [
        ...config.colors.normal,
        ...config.colors.vip
    ];

    const memberColorRole = member.roles.cache
        .filter(r => colorRoles.includes(r.id))
        .first();

    const nameX = 380
    const nameY = 75

    ctx.textAlign = "left";

    ctx.font = `bold ${member.user.username.length > 20 ? "24px": "32px"} Bauhaus`;


    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.strokeText(member.user.username, nameX, nameY);

    ctx.fillStyle = memberColorRole ? memberColorRole.hexColor : "#ffffff";
    ctx.fillText(member.user.username, nameX, nameY);

    // ====== BARRA DE XP ======
    const barX = 609; // centro da barra
    const barY = bg.height / 2;
    const barWidth = 561;
    const barHeight = 38;
    const progress = Math.min(profile.xp / xpForNextLevel, 1);

    // Barra de progresso
    ctx.fillStyle = "#00a4ea";
    ctx.beginPath();
    ctx.roundRect(barX - barWidth / 2, barY - barHeight / 2, barWidth * progress, barHeight, radius);
    ctx.fill();


    // Texto XP
    ctx.font = "bold 22px Bauhaus";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${profile.xp}/${xpForNextLevel}`, barX, barY);

    ctx.textBaseline = "alphabetic";

    // ====== PRÓXIMO CARGO ======

    const nextRole = getNextRoleLevel(level);

    let role = null;

    if (nextRole) {
        role = await guild.roles.fetch(nextRole.role)
    }

    ctx.fillText(`${nextRole ? "Próximo cargo: " + role?.name : "Você já obteve todos os cargos!"}`, barX, barY + 40);

    ctx.textBaseline = "alphabetic";


    // ====== ESTATÍSTICAS ======

    const statsY = 355;

    ctx.textAlign = "center";
    ctx.font = "bold 28px Bauhaus";
    ctx.fillStyle = "#ffffff";

    ctx.fillText(`🗨️ ${profile.messages}`, 412, statsY);

    ctx.fillText(`📢 ${formatTime(profile.voiceTime)}`, 606, statsY);

    ctx.fillText(`🏆 ${profile.digitGameVictories}`, 806, statsY);

    // ====== SALVAR ======
    const buffer = canvas.toBuffer("image/png");
    writeFileSync(`./src/assets/generated/rank.png`, buffer);
}

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

function getNextRoleLevel(currentLevel: number): {level: number, role: string} | null {
    const levelRewards: Record<number, { giveaway?: number, role?: string }> = {
        7: {giveaway: 1, role: "1431395260558344383"},
        17: {role: "1431395444293894154"},
        27: {role: "1431395599638593685"},
        37: {role: "1431396556757794837"},
        47: {role: "1431396700060254269"},
        57: {role: "1431396754024169572"},
        67: {role: "1431396813285625936"},
        77: {role: "1431396853781495880"}
    };

    const levels = Object.keys(levelRewards)
        .map(Number)
        .filter(l => levelRewards[l].role) // só níveis que têm role
        .sort((a, b) => a - b);

    for (const level of levels) {
        if (level > currentLevel) {
            return {level, role: levelRewards[level].role!};
        }
    }

    return null;
}
