import {Command} from "../../types/discord/Command";
import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    GuildMember,
    SlashCommandBuilder
} from "discord.js";
import {InteractionContextType} from "discord-api-types/v10";
import {client} from "../../index";
import {getOrCreateProfile} from "../../repositories/profile";
import {createCanvas, loadImage, registerFont} from "canvas";
import {Achievement, Profile} from "../../types/database/models/Profile";
import {writeFileSync} from "fs";
import {getAchievementByNumber} from "../../types/database/models/Achievements";
import {canvasRGBA} from "stackblur-canvas";


export default new Command({
    build() {
        return new SlashCommandBuilder()
            .setName("conquistas")
            .setDescription("Vizualize uma conquista")
            .setContexts(InteractionContextType.Guild)
            .addIntegerOption(opt =>
                opt.setName("id")
                    .setDescription("ID da conquista")
                    .setRequired(false)
            )
    },
    run: async ({ interaction, options }) => {

        await interaction.deferReply()

        const guild = client.getMainGuild();

        if (!guild) return

        const user = interaction.user;

        if (user.bot) return;

        const member = guild.members.cache.get(user.id)
            || await guild.members.fetch(user.id).catch(() => null);

        if (!member) return;


        const id = options.getInteger("id")?? 1;

        try {
            const achievement = getAchievementByNumber(id);

            getOrCreateProfile(interaction.user.id).then(async profile => {

                if (!profile) return await interaction.editReply("Perfil não encontrado.");

                await generateAchievementImage(member, achievement, profile);

                const attachment = new AttachmentBuilder(`./src/assets/generated/achievement.png`);
                await interaction.editReply({
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

            }).catch(err => {
                console.log(err);
            })
        } catch (e) {
            await interaction.editReply("Conquista inválida.");
        }


    }
});

export async function generateAchievementImage(member: GuildMember, achievement: Achievement, profile: Profile) {

    const canvas = createCanvas(1600, 900);
    const ctx = canvas.getContext("2d");
    const img = await loadImage(achievement.bannerURL);

    const profA = profile.profileAchievements.find(a => a.achievement.id === achievement.id);

    registerFont('./src/assets/font/Bauhaus.ttf', { family: 'Bauhaus' });
    registerFont('./src/assets/font/NotoColorEmoji.ttf', { family: 'Emoji' });

    // ====== BACKGROUND ======
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    canvasRGBA(canvas, 0, 0, canvas.width, canvas.height, 5);

// escurece com overlay preto
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ====== AVATAR ======
    const avatar = await loadImage(member.displayAvatarURL({ extension: "png", size: 512 }));
    const avatarSize = 250;
    const avatarX = canvas.width / 2;
    const avatarY = 300;

// Brilho
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarSize / 2 + 10, 0, Math.PI * 2); // círculo levemente maior
    ctx.closePath();
    ctx.shadowColor = "#00ffff"; // cor do brilho
    ctx.shadowBlur = 30;          // intensidade do brilho
    ctx.fillStyle = "#00ffff";    // precisa ter uma cor de preenchimento
    ctx.fill();
    ctx.restore();

// Avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
        avatar,
        avatarX - avatarSize / 2,
        avatarY - avatarSize / 2,
        avatarSize,
        avatarSize
    );
    ctx.restore();

    // ====== TEXTO ======

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 6;


    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";

    ctx.font = 'bold 96px "Emoji, Bauhaus"';
    ctx.fillText(achievement.name, canvas.width / 2, 550);

    ctx.font = '52px "Emoji, Bauhaus"';
    ctx.fillText(achievement.description, canvas.width / 2, 620);

    ctx.font = '32px "Emoji, Bauhaus"';
    ctx.fillText(
        profA ? "Obtido em " + profA.obtainedAt.toLocaleDateString("pt-BR") : "Não obtido ainda",
        canvas.width / 2,
        800
    );
    // ====== FILTRO PRETO E BRANCO ======
    if (!profA) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = data[i + 1] = data[i + 2] = avg;
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // ====== SALVAR ======
    const buffer = canvas.toBuffer("image/png");
    writeFileSync(`./src/assets/generated/achievement.png`, buffer);
}
