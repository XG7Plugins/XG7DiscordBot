import {Command} from "../../types/discord/Command";
import {AttachmentBuilder, Guild, GuildMember, SlashCommandBuilder} from "discord.js";
import {InteractionContextType} from "discord-api-types/v10";
import {getLevelInfo, getOrCreateProfile} from "../../repositories/profile";
import {saveTime} from "../../listeners/ranks/call";
import {client, config} from "../../index";
import { createCanvas, loadImage, registerFont } from "canvas";
import { writeFileSync } from "fs";
import {Profile} from "../../types/database/models/Profile";

export default new Command({
    build() {
        return new SlashCommandBuilder()
            .setName("profile")
            .setDescription("Ve o seu perfil")
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

            const attachment = new AttachmentBuilder(`./src/assets/generated/${profile.id}.jpg`);
            await interaction.reply({ content: "<@" + interaction.user.id + ">", files: [attachment] });


        }).catch(err => {
            console.log(err);
        })

    }
});

/**
 * Gera imagem de perfil
 */
export async function generateImage(member: GuildMember, profile: Profile) {

    const bg = await loadImage(profile.profileBgURL ? profile.profileBgURL : "./src/assets/images/profilebgs/" + profile.profileBgID + ".jpg");
    const canvas = createCanvas(1600, 900);
    const ctx = canvas.getContext("2d");

    registerFont('./src/assets/font/Bauhaus.ttf', { family: 'Bauhaus' });

    // ====== FUNDO ======
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // ====== MARCA-PÁGINA ======
    const bookmarkWidth = 360;
    const bookmarkHeight = 500;
    const bookmarkX = 50; // distância da esquerda

    // retângulo colorido de fundo
    ctx.fillStyle = "rgba(0,127,255,0.5)";
    ctx.fillRect(bookmarkX, 0, bookmarkWidth, bookmarkHeight);

    // ====== AVATAR ======
    const avatar = await loadImage(member.displayAvatarURL({ extension: "png", size: 512 }));
    const avatarSize = 240;
    const avatarX = bookmarkX + (bookmarkWidth - avatarSize) / 2;
    const avatarY = 20;

    // círculo
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // ====== NOME DO USUÁRIO ======
    const colorRoles: string[] = [
        ...config.colors.normal,
        ...config.colors.vip
    ];

    const memberColorRole = member.roles.cache
        .filter(r => colorRoles.includes(r.id))
        .first();

    ctx.textAlign = "center";

    const textX = avatarX + avatarSize / 2; // centro do avatar
    const textY = avatarY + avatarSize + 40;

    ctx.font = `${member.user.username.length > 11 ? "32px": "48px"} Bauhaus`;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.strokeText(member.user.username, textX, textY);

    ctx.fillStyle = memberColorRole ? memberColorRole.hexColor : "#ffffff";
    ctx.fillText(member.user.username, textX, textY);

    ctx.lineWidth = 0;

    // ====== Cargo ======

    ctx.textAlign = "center";

    const roleX = avatarX + avatarSize / 2; // centro do avatar
    const roleY = avatarY + avatarSize + 80;

    ctx.font = `bold 32px Bauhaus`;

    ctx.fillStyle = "#ffffff";
    ctx.fillText(getRoleLevel(member.guild, getLevelInfo(profile.xp).level)?? "Iniciante", roleX, roleY);

    // ====== RODAPÉ ======
    const footerWidth = 900;
    const footerHeight = 200;
    const footerY = canvas.height - footerHeight;

    // retângulo colorido de fundo
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, footerY, footerWidth, footerHeight);

    // ====== BIO ======

    ctx.textAlign = "left";

    const bioX = 30; // centro do avatar
    const bioY = footerY + 50;

    ctx.font = `32px Bauhaus`;
    ctx.lineWidth = 3;

    ctx.fillStyle = "#ffffff";

    const bioText = profile.bio.length == 0
        ? "Membro importante para XG7Community :3. Sabia que dá para trocar essa bio com o comando /customize-profile?"
        : profile.bio;

    drawTextWrapped(ctx, bioText, bioX, bioY, footerWidth, 40);

    // ====== SALVAR ======
    const buffer = canvas.toBuffer("image/jpeg");
    writeFileSync(`./src/assets/generated/${profile.id}.jpg`, buffer);
}

function getRoleLevel(guild: Guild, currentLevel: number): string | undefined {
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
        if (level <= currentLevel) {
            return guild.roles.cache.get(levelRewards[level].role!)?.name
        }
    }
}

//util
function drawTextWrapped(ctx: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
            ctx.fillStyle = "#ffffff";
            ctx.fillText(line, x, currentY);
            line = words[n] + " ";
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }

    if (line) {
        ctx.fillStyle = "#ffffff";
        ctx.fillText(line, x, currentY);
    }
}
