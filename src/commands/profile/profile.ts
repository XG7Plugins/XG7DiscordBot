import {Command} from "../../types/discord/Command";
import {
    ActionRowBuilder,
    Attachment,
    AttachmentBuilder, ButtonBuilder, ButtonStyle,
    CommandInteraction,
    Guild,
    GuildMember,
    MessageFlags,
    SlashCommandBuilder, TextChannel
} from "discord.js";
import {InteractionContextType} from "discord-api-types/v10";
import {getLevelInfo, getOrCreateProfile, getProfileBGCount, updateProfile} from "../../repositories/profile";
import {saveTime} from "../../listeners/ranks/call";
import {client, config} from "../../index";
import {createCanvas, loadImage, registerFont} from "canvas";
import {writeFileSync} from "fs";
import {Profile} from "../../types/database/models/Profile";
import ColorComponent from "../../components/template/color";
import ImageRequestComponent from "../../components/template/image_request";
import {generateAchievementImage} from "./achievement";


const profileBGCount = getProfileBGCount();

export default new Command({
    build() {
        return new SlashCommandBuilder()
            .setName("perfil")
            .setDescription("Gerencie ou visualize perfis de usuário")
            .setContexts(InteractionContextType.Guild)

            // /profile → ver o próprio perfil
            .addSubcommand(sub =>
                sub
                    .setName("ver")
                    .setDescription("Veja o seu perfil ou de outro usuário")
                    .addUserOption(opt =>
                        opt.setName("user")
                            .setDescription("Usuário cujo perfil será exibido")
                    )
            )

            // /profile bio → alterar a bio
            .addSubcommand(sub =>
                sub
                    .setName("bio")
                    .setDescription("Muda sua bio")
                    .addStringOption(opt =>
                        opt.setName("texto")
                            .setDescription("Nova bio")
                            .setRequired(true)
                    )
            )

            // /profile banner → mudar o banner
            .addSubcommand(sub =>
                sub
                    .setName("banner")
                    .setDescription("Muda o banner do seu perfil")
                    .addBooleanOption(opt => opt
                        .setName("aleatório")
                        .setDescription("Define um banner aleatório")
                        .setRequired(true)
                    )
                    .addIntegerOption(opt =>
                        opt.setName("id")
                            .setDescription(`Digite um número de 1-${profileBGCount}"`)
                            .setRequired(false)
                    )
                    .addStringOption(opt =>
                        opt.setName("url")
                            .setDescription("Digite uma URL de imagem")
                            .setRequired(false)
                    )
                    .addAttachmentOption(opt =>
                        opt.setName("file")
                            .setDescription("Insira um arquivo de imagem")
                            .setRequired(false)
                    )
            )

            // /profile cor → abrir seletor de cores

            .addSubcommand(sub =>
                sub
                    .setName("cor")
                    .setDescription("Abre o seletor de cores")
            )
            .addSubcommand(sub =>
                sub
                    .setName("conquistas")
                    .setDescription("Ve as conquistas de um usuário")
                    .addUserOption(opt =>
                        opt.setName("user")
                            .setDescription("Usuário cujo perfil será exibido")
                    )
            )
    },
    run: async ({ interaction, options }) => {
        
        const guild = client.getMainGuild();

        if (!guild) return

        const sub = options.getSubcommand();

        await interaction.deferReply({ephemeral: sub !== "ver" && sub !== "conquistas"});

        if (sub == "cor") return color(interaction, interaction.member as GuildMember);

        if (sub == "ver" || sub == "conquistas") {
            const user = options.getUser("user")?? interaction.user;

            if (user.bot) {
                await interaction.editReply("Este usuário é um robô.");
                return;
            }

            const member = guild.members.cache.get(user.id)
                || await guild.members.fetch(user.id).catch(() => null);

            if (!member) return;

            if (sub == "conquistas") {
                return achievements(interaction, member, await getOrCreateProfile(user.id))
            }

            return view(interaction, member, await getOrCreateProfile(user.id))

        }

        getOrCreateProfile(interaction.user.id).then(async profile => {

            if (!profile) return await interaction.editReply("Perfil não encontrado.");

            if (sub == "bio") {
                const text = options.getString("texto", true);
                return bio(interaction, profile, text)
            }

            if (sub == "banner") {

                const id = options.getInteger("id");
                const file = options.getAttachment("file");
                const url = options.getString("url");
                const random = options.getBoolean("aleatório", true);

                return banner(interaction, profile, random, id, url, file)
            }


        }).catch(err => {
            console.log(err);
        })

    }
});

async function view(interaction: CommandInteraction, member: GuildMember, profile: Profile | null) {

    if (!profile) return await interaction.editReply("Perfil não encontrado.");


    await saveTime(member, profile, false);

    await generateImage(member, profile);

    const attachment = new AttachmentBuilder(`./src/assets/generated/profile.png`);
    await interaction.editReply({ content: "<@" + interaction.user.id + ">", files: [attachment] });


}
async function bio(interaction: CommandInteraction, profile: Profile, text: string) {

    profile.bio = text;

    await updateProfile(interaction.user.id, profile)

    await interaction.editReply({content: "Perfil atualizado com sucesso!"});

}
async function banner(interaction: CommandInteraction, profile: Profile, random: boolean, id: number | null, url: string | null, file: Attachment | null) {

    if (random) {
        const id = Math.floor(Math.random() * profileBGCount) + 1;
        profile.profileBgPath =  `./src/assets/images/profile_bgs/${id}.jpg`;

        await updateProfile(interaction.user.id, profile)

        await interaction.editReply({ content: "Imagem alterada com sucesso para o id: " + id});
        return;

    }

    if (!random && (!id && !url && !file)) {
        await interaction.editReply({content: "Você precisa inserir o id, o arquivo ou o url de seu banner."});
        return;
    }

    let image: Attachment | AttachmentBuilder | undefined;

    if (url) {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                await interaction.editReply({ content: "URL inválida ou inacessível."});
                return;
            }

            // Verifica se é imagem
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.startsWith("image/")) {
                await interaction.editReply({ content: "A URL fornecida não é uma imagem."});
                return;
            }

            // Converte o conteúdo em buffer
            const buffer = Buffer.from(await response.arrayBuffer());
            image = new AttachmentBuilder(buffer, { name: `banner-${profile.id}.jpg` });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: "Erro ao baixar a imagem."});
            return;
        }
    }

    if (file) {
        image = file;
        image.name = `banner-${profile.id}.jpg`;
    }

    if (!image) {
        
        if (!id) {
            await interaction.editReply({ content: "Insira um id!"});
            return;
        }

        if (id < 1 || id > profileBGCount) {
            await interaction.editReply({ content: "ID Fora dos limites!"});
            return;
        }

        profile.profileBgPath =  `./src/assets/images/profile_bgs/${id}.jpg`;

        await updateProfile(interaction.user.id, profile)

        await interaction.editReply({ content: "Imagem alterada com sucesso!."});
        return;

    }

    const guild = client.getMainGuild();

    if (!guild) return

    guild.channels.fetch("1432422716870234225")
        .then(channel => channel as TextChannel)
        .then(async channel => {

            if (!channel) return;

            await channel.send({
                content: `# Requisição de aprovação de imagem para banner de <@${profile.id}>!`,
                components: ImageRequestComponent(),
                files: [image]
            });

            await interaction.editReply({content: "Imagem enviada para avaliação, aguarde um momento até que ela seja aceita."});

        })
}

async function color(interaction: CommandInteraction, member: GuildMember) {

    const isVIP = member.roles.cache.hasAny("1424094092304056492", "1328930300364849203", "1235570566778327152");

    const colorRoles = [
        ...config.colors.normal,
        ...(isVIP ? config.colors.vip : [])
    ];

    await interaction.editReply({
        components: ColorComponent(colorRoles),
        flags: MessageFlags.IsComponentsV2
    })
}

async function achievements(interaction: CommandInteraction, member: GuildMember, profile: Profile | null) {
    if (!profile) return await interaction.editReply("Perfil não encontrado.");

    if (profile.profileAchievements.length == 0) {
        return await interaction.editReply("Este perfil não tem conquistas.");
    }


    await generateAchievementImage(member, profile.profileAchievements[0].achievement, profile)

    const attachment = new AttachmentBuilder(`./src/assets/generated/achievement.png`);
    await interaction.editReply({
        content: "<@" + interaction.user.id + ">\nConquistas de: " + member.user.username,
        files: [attachment],
        components: [
            new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setEmoji("⬅️")
                        .setCustomId(`achpf_${member.id}_${-1}`)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setEmoji("➡️")
                        .setCustomId(`achpf_${member.id}_${1}`)
                        .setStyle(ButtonStyle.Primary)
                )
        ]
    });





}

/**
 * Gera imagem de perfil
 */
export async function generateImage(member: GuildMember, profile: Profile) {

    const bg = await loadImage(profile.profileBgPath);
    const canvas = createCanvas(1600, 900);
    const ctx = canvas.getContext("2d");

    registerFont('./src/assets/font/Bauhaus.ttf', { family: 'Bauhaus' });
    registerFont('./src/assets/font/NotoColorEmoji.ttf', { family: 'Emoji' });

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

    let displayName = member.user.username;

    if (member.roles.cache.has("1235570566778327152")) displayName += "💎"
    if (member.roles.cache.hasAny("1328930300364849203", "1424094092304056492")) displayName += "🌟"
    if (member.roles.cache.has("1364270135564566538")) displayName += "⚒️"
    if (member.roles.cache.has("1348081207925018624")) displayName += "💖"

    ctx.font = `${displayName.length > 11 ? "32px": "48px"} Emoji, Bauhaus`;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffffff";
    ctx.strokeText(displayName, textX, textY);

    ctx.fillStyle = memberColorRole ? memberColorRole.hexColor : "#ffffff";
    ctx.fillText(displayName, textX, textY);

    ctx.lineWidth = 0;

    // ====== Cargo ======

    ctx.textAlign = "center";

    const roleX = avatarX + avatarSize / 2; // centro do avatar
    const roleY = avatarY + avatarSize + 80;

    ctx.font = `bold 32px Emoji, Bauhaus`;

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

    ctx.font = `32px Emoji, Bauhaus`;
    ctx.lineWidth = 3;

    ctx.fillStyle = "#ffffff";

    const bioText = profile.bio.length == 0
        ? "Membro importante para XG7Community :3. Sabia que dá para trocar essa bio com o comando /perfil bio?"
        : profile.bio;

    drawTextWrapped(ctx, bioText, bioX, bioY, footerWidth, 40);

    // ====== SALVAR ======
    const buffer = canvas.toBuffer("image/png");
    writeFileSync(`./src/assets/generated/profile.png`, buffer);
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
