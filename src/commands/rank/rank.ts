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

        await interaction.deferReply()

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

            await generateImage(member, profile);

            const attachment = new AttachmentBuilder("./src/assets/generated/rank.png");
            await interaction.editReply({ content: "<@" + interaction.user.id + ">", files: [attachment] });


        }).catch(err => {
            console.log(err);
        })

    }
});

/**
 * Gera imagem de perfil (rank card)
 */
export async function generateImage(member: GuildMember, profile: Profile) {
    const { level, xpForNextLevel, currentLevelXp } = getLevelInfo(profile.xp);
    const guild = client.getMainGuild();
    if (!guild) return;

    const repo = database.repositories.get("profiles") as ProfileRepository;
    if (!repo) return;

    const leaderboardPos = await repo.getUserPosition(profile.id);

    // ====== IMAGENS ======
    const bg = await loadImage("./src/assets/images/rank_bg.png");
    const chat = await loadImage("./src/assets/icons/balao-de-fala.png");
    const coracao = await loadImage("./src/assets/icons/coracao.png");
    const diamante = await loadImage("./src/assets/icons/diamante.png");
    const estrela = await loadImage("./src/assets/icons/estrela.png");
    const martelo = await loadImage("./src/assets/icons/martelo.png");
    const megafone = await loadImage("./src/assets/icons/megafone.png");
    const trofeu = await loadImage("./src/assets/icons/trofeu.png");

    registerFont("./src/assets/font/Bauhaus.ttf", { family: "Bauhaus" });

    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");

    // ====== FUNDO ======
    ctx.drawImage(bg, 0, 0);

    // ====== AVATAR ======
    const avatar = await loadImage(member.displayAvatarURL({ extension: "png", size: 256 }));
    const avatarSize = 170;
    const avatarX = 163.45;
    const avatarY = 124.5;
    const radius = 20;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize, radius);
    ctx.clip();
    ctx.drawImage(avatar, avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize);
    ctx.restore();

    // ====== LEVEL ======
    ctx.textAlign = "center";
    ctx.font = "bold 32px Bauhaus";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Nível: ${level}`, 163.45, 260.5);

    // ====== RANK ======
    ctx.textAlign = "center";
    ctx.font = "bold 52px Bauhaus";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`#${leaderboardPos.position}`, 859.64, 75);

    // ====== NOME  ======
    const colorRoles: string[] = [...config.colors.normal, ...config.colors.vip];
    const memberColorRole = member.roles.cache.filter(r => colorRoles.includes(r.id)).first();

    const nameX = 380;
    const nameY = 75;
    ctx.textAlign = "left";
    ctx.font = "bold 32px Bauhaus";

    const fontSize = 32;
    const iconSize = fontSize * 0.9;
    let offsetX = nameX;

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffffff";
    ctx.strokeText(member.user.username, offsetX, nameY);
    ctx.fillStyle = memberColorRole ? memberColorRole.hexColor : "#ffffff";
    ctx.fillText(member.user.username, offsetX, nameY);
    offsetX += ctx.measureText(member.user.username).width + 10;

    if (member.roles.cache.has("1235570566778327152")) {
        ctx.drawImage(diamante, offsetX, nameY - iconSize * 0.8, iconSize, iconSize);
        offsetX += iconSize + 6;
    }
    if (member.roles.cache.hasAny("1328930300364849203", "1424094092304056492")) {
        ctx.drawImage(estrela, offsetX, nameY - iconSize * 0.8, iconSize, iconSize);
        offsetX += iconSize + 6;
    }
    if (member.roles.cache.has("1364270135564566538")) {
        ctx.drawImage(martelo, offsetX, nameY - iconSize * 0.8, iconSize, iconSize);
        offsetX += iconSize + 6;
    }
    if (member.roles.cache.has("1348081207925018624")) {
        ctx.drawImage(coracao, offsetX, nameY - iconSize * 0.8, iconSize, iconSize);
    }

    // ====== BARRA DE XP ======
    const barX = 609;
    const barY = bg.height / 2;
    const barWidth = 561;
    const barHeight = 38;
    const progress = Math.min((profile.xp - currentLevelXp) / (xpForNextLevel - currentLevelXp), 1);

    ctx.fillStyle = "#00a4ea";
    ctx.beginPath();
    ctx.roundRect(barX - barWidth / 2, barY - barHeight / 2, barWidth * progress, barHeight, radius);
    ctx.fill();

    ctx.font = "bold 22px Bauhaus";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${profile.xp}/${xpForNextLevel}`, barX, barY);
    ctx.textBaseline = "alphabetic";

    // ====== PRÓXIMO CARGO ======
    const nextRole = getNextRoleLevel(level);
    let role = null;
    if (nextRole) role = await guild.roles.fetch(nextRole.role);

    ctx.fillText(`${nextRole ? "Próximo cargo: " + role?.name : "Você já obteve todos os cargos!"}`, barX, barY + 40);

    // ====== ESTATÍSTICAS ======
    const statsY = 355;
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";

    // Mensagens
    ctx.font = `bold ${profile.messages.toString().length > 6 ? "20px" : "28px"} Bauhaus`;
    ctx.fillText(profile.messages.toString(), 477, statsY);
    ctx.drawImage(chat, 347, statsY - 24, 28, 28);

    // Tempo de voz

    let timeText = formatTime(profile.voiceTime);

    while (timeText.length > 7) timeText = timeText.substring(0, 4)

    ctx.font = `bold ${timeText.length > 6 ? "20px" : "28px"} Bauhaus`;
    ctx.fillText(timeText, 671, statsY);
    ctx.drawImage(megafone, 541, statsY - 24, 28, 28);

    // Vitorias
    ctx.font = `bold ${profile.digitGameVictories.toString().length > 10 ? "16px" : profile.digitGameVictories.toString().length > 6 ? "18px" : "28px"} Bauhaus`;
    ctx.fillText(profile.digitGameVictories.toString(), 871, statsY);
    ctx.drawImage(trofeu, 741, statsY - 24, 28, 28);

    // ====== SALVAR ======
    const buffer = canvas.toBuffer("image/png");
    writeFileSync("./src/assets/generated/rank.png", buffer);
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
