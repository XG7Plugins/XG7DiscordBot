import {Command} from "../../types/discord/Command";
import {PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {InteractionContextType} from "discord-api-types/v10";
import {client} from "../../index";
import {getOrCreateProfile, updateProfile} from "../../repositories/profile";

export default new Command({
    build() {
        return new SlashCommandBuilder()
            .setName("xp")
            .setDescription("Manipule o xp de alguem")
            .setContexts(InteractionContextType.Guild)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

            // /profile → ver o próprio perfil
            .addSubcommand(sub =>
                sub
                    .setName("adicionar")
                    .setDescription("Veja o seu perfil ou de outro usuário")
                    .addUserOption(opt =>
                        opt.setName("user")
                            .setDescription("Usuário cujo perfil será manipulado")
                            .setRequired(true)
                    )
                    .addIntegerOption(opt =>
                        opt.setName("xp")
                            .setDescription("Quantidade de xp a ser adicionada")
                            .setRequired(true)
                    )
            )

            // /profile bio → alterar a bio
            .addSubcommand(sub =>
                sub
                    .setName("remover")
                    .setDescription("Muda sua bio")
                    .addUserOption(opt =>
                        opt.setName("user")
                            .setDescription("Usuário cujo perfil será manipulado")
                            .setRequired(true)
                    )
                    .addIntegerOption(opt =>
                        opt.setName("xp")
                            .setDescription("Quantidade de xp a ser removida")
                            .setRequired(true)
                    )
            )
    },
    run: async ({ interaction, options }) => {

        const guild = client.getMainGuild();

        if (!guild) return

        const sub = options.getSubcommand();

        const xp = sub === "adicionar" ? options.getInteger("xp", true) : -options.getInteger("xp", true);

        await interaction.deferReply({ ephemeral: true});

        const user = options.getUser("user", true);

        if (user.bot) return;

        const member = guild.members.cache.get(user.id)
            || await guild.members.fetch(user.id).catch(() => null);

        if (!member) return;

        getOrCreateProfile(user.id).then(async profile => {
            if (!profile) return await interaction.editReply("Perfil não encontrado!");

            await updateProfile(user.id, {xp: profile.xp + xp})

            await interaction.editReply("XP atualizado com sucesso para " + (profile.xp + xp) + "XP!");

        })

    }
})