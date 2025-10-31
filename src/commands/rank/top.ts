import {Command} from "../../types/discord/Command";
import {AttachmentBuilder, MessageFlags, SlashCommandBuilder} from "discord.js";
import {InteractionContextType} from "discord-api-types/v10";
import ProfileRepository, {getLevelInfo, getOrCreateProfile} from "../../repositories/profile";
import {saveTime} from "../../listeners/ranks/call";
import {client, database} from "../../index";
import {createCanvas, loadImage, registerFont} from "canvas";
import {writeFileSync} from "fs";
import TopComponent from "../../components/template/top";

export default new Command({
    build() {
        return new SlashCommandBuilder()
            .setName("top")
            .setDescription("Ve o os tops")
            .setContexts(InteractionContextType.Guild)
            .addSubcommand(sub =>
                sub
                    .setName("messages")
                    .setDescription("Ver top de mensagens")
                    .addIntegerOption(option => option.setName("page").setDescription("Página").setRequired(false))
            )
            .addSubcommand(sub =>
                sub
                    .setName("voice")
                    .setDescription("Ver top tempo em call")
                    .addIntegerOption(option => option.setName("page").setDescription("Página").setRequired(false))
            )
            .addSubcommand(sub =>
                sub
                    .setName("xp")
                    .setDescription("Ver top de xp")
                    .addIntegerOption(option => option.setName("page").setDescription("Página").setRequired(false))
            )
            .addSubcommand(sub =>
                sub
                    .setName("digit")
                    .setDescription("Ver top do jogo do dígito")
                    .addIntegerOption(option => option.setName("page").setDescription("Página").setRequired(false))
            );

    },
    run: async ({ interaction, options }) => {

        await interaction.deferReply()

        const guild = client.getMainGuild();

        if (!guild) return

        await guild.members.fetch()

        const user = options.getUser("user")?? interaction.user;

        if (user.bot) return;

        const member = guild.members.cache.get(user.id)
            || await guild.members.fetch(user.id).catch(() => null);

        if (!member) return;

        const type = options.getSubcommand() as "messages" | "xp" | "voice" | "digit";

        const pageNumber = options.getInteger("page") ?? 1;

        if (pageNumber < 0 || pageNumber > Math.floor(guild.members.cache.size / 10 + 1)) {
            await interaction.editReply({content: "Página fora do limite!"});
            return
        }

        getOrCreateProfile(user.id).then(async profile => {

            if (!profile) return await interaction.editReply("Perfil não encontrado.");

            await saveTime(member, profile, false);

            await generateTopImage(pageNumber, type);

            const attachment = new AttachmentBuilder("./src/assets/generated/top.png");
            await interaction.editReply({ files: [attachment], flags: MessageFlags.IsComponentsV2, components: [TopComponent(pageNumber, Math.floor(guild.members.cache.size / 10) + 1, type)] });


        }).catch(err => {
            console.log(err);
        })

    }
});

/**
 * Gera imagem de TOP
 */
export async function generateTopImage(page: number, type: "messages" | "xp" | "voice" | "digit") {
    const guild = client.getMainGuild();
    if (!guild) return;
    const repo = database.repositories.get("profiles") as ProfileRepository;
    if (!repo) return;

    const leaderboard = await repo.getLeaderboard(type, page * 10);

    const img = await loadImage("./src/assets/images/top_bg.png");
    const chat = await loadImage("./src/assets/icons/balao-de-fala.png");
    const xpIcon = await loadImage("./src/assets/icons/xp.png");
    const megafone = await loadImage("./src/assets/icons/megafone.png");
    const trofeu = await loadImage("./src/assets/icons/trofeu.png");

    registerFont('./src/assets/font/Bauhaus.ttf', { family: 'Bauhaus' });

    const spacing = 20;

    const canvas = createCanvas(img.width, (img.height) * 10 + spacing * 5.5);
    const ctx = canvas.getContext("2d");


    const users = await guild.members.fetch();

    const avatarSize = 56;
    const rowHeight = img.height + 10; // adiciona espaço transparente entre linhas

    ctx.font = '20px Bauhaus';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';

    const start = (page - 1) * 10;
    const end = page * 10;

    let i = 0;
    let pos = start;

    for (const { id, point, xp } of leaderboard.slice(start, Math.min(end, leaderboard.length))) {
        const user = users.get(id);
        if (!user) continue;

        const y = i * rowHeight + spacing;

        // fundo
        ctx.drawImage(img, 0, y, img.width, img.height);

        // avatar
        const avatar = await loadImage(user.displayAvatarURL({ extension: "png", size: 256 }));

        const avatarX = 7;
        const avatarY = y + (img.height - avatarSize) / 2;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(avatarX, avatarY, avatarSize, avatarSize, 10); // ← sem subtrair avatarSize/2
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // nome de usuário
        const text = `#${pos + 1} . ${user.user.username} ${type === "xp" ? "(" + getLevelInfo(xp).level.toString() + ")" : ""}`;
        ctx.textAlign = "left";
        ctx.fillText(text, avatarSize + spacing * 2, y + img.height / 2);

        // pontuação
        const pointX = img.width - spacing;
        const pointY = y + img.height / 2;
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";

        if (type === "voice") {
            ctx.fillText(formatTime(point), pointX - 24, pointY);
            ctx.drawImage(megafone, pointX - 20, pointY - 12, 24, 24);
        } else if (type === "messages") {
            ctx.fillText(point.toString(), pointX - 24, pointY);
            ctx.drawImage(chat, pointX - 20, pointY - 12, 24, 24);
        } else if (type === "xp") {
            ctx.fillText(point.toString(), pointX - 24, pointY);
            ctx.drawImage(xpIcon, pointX - 20, pointY - 12, 24, 24);
        } else if (type === "digit") {
            ctx.fillText(point.toString(), pointX - 24, pointY);
            ctx.drawImage(trofeu, pointX - 20, pointY - 12, 24, 24);
        }

        i++;
        pos++;
    }

    const buffer = canvas.toBuffer("image/png");
    writeFileSync(`./src/assets/generated/top.png`, buffer);
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