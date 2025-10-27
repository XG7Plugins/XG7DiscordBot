import {Command} from "../../types/discord/Command";
import {ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import {InteractionContextType} from "discord-api-types/v10";
import {getOrCreateProfile} from "../../repositories/profile";
import {client} from "../../index";

export default new Command({
    build() {
        return new SlashCommandBuilder()
            .setName("customize-profile")
            .setDescription("Customiza seu perfil")
            .setContexts(InteractionContextType.Guild)
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

            console.log("BIO " + JSON.stringify(profile))

            const modal = new ModalBuilder()
                .setCustomId("customize-bio")
                .setTitle("Customize seu perfil");

            const input1 = new TextInputBuilder()
                .setCustomId("bio")
                .setLabel("Bio")
                .setPlaceholder("Digite sua nova bio")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            if (profile.bio && profile.bio.length > 0) {
                input1.setValue(profile.bio);
            }

            const input2 = new TextInputBuilder()
                .setCustomId("banner")
                .setLabel("Banner de perfil")
                .setPlaceholder("Digite um número de 1-23 ou uma url")
                .setStyle(TextInputStyle.Short)
                .setValue(String(profile.profileBgURL ?? profile.profileBgID))
                .setRequired(true);

            modal.addComponents(input1, input2);

            // Mostra o modal ao usuário
            await interaction.showModal(modal);

        }).catch(err => {
            console.log(err);
        })

    }
});
