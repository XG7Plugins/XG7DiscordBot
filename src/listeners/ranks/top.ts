import {Listener} from "../../types/discord/Event";
import {client} from "../../index";
import {getOrCreateProfile} from "../../repositories/profile";
import {generateTopImage} from "../../commands/rank/top";
import {AttachmentBuilder, MessageFlags} from "discord.js";
import TopComponent from "../../components/template/top";

export default new Listener({
    type: "interactionCreate",
    async handle(interaction): Promise<any> {

        if (!interaction.isButton()) return

        const id = interaction.customId;

        if (!id.startsWith("top_")) return;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral});

        // Divide o ID em partes
        const [, type, pageStr] = id.split("_");
        const page = Number(pageStr);

        const guild = client.getMainGuild();

        if (!guild) return

        await guild.members.fetch();

        if (page < 0 || page > Math.floor(guild.members.cache.size / 10 + 1)) {
            await interaction.editReply({content: "Página fora do limite!"});
            return;
        }


        const user = interaction.user;

        if (user.bot) return;

        const member = guild.members.cache.get(user.id)
            || await guild.members.fetch(user.id).catch(() => null);

        if (!member) return;

        getOrCreateProfile(user.id).then(async profile => {

            if (!profile) return await interaction.editReply("Perfil não encontrado.");

            await generateTopImage(page, type as "messages" | "xp" | "voice");

            const attachment = new AttachmentBuilder("./src/assets/generated/top.png");

            await interaction.message.edit({ files: [attachment], components: [TopComponent(page, Math.floor(guild.members.cache.size / 10) + 1, type as "messages" | "xp" | "voice")] });

            await interaction.editReply("Página alterada!")

        });



    }

})