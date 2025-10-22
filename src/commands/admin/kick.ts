import {Command} from "../../types/discord/Command";
import {ApplicationCommandOptionType, MessageFlags} from "discord.js";
import {client, database} from "../../index";
import console from "node:console";
import KickComponent from "../../components/template/kick_display";

export default new Command({
    data: {
        name: "kick",
        description: "Expulsa membros",
        defaultMemberPermissions: ["Administrator"],
        dmPermission: false,
        options: [
            {
                name: "user",
                description: "Usuário a ser expulso",
                type: ApplicationCommandOptionType.User,
                required: true
            },
            {
                name: "reason",
                description: "Razão da expulsão",
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    run: async ({ interaction, options }) => {

        await interaction.deferReply({flags: [MessageFlags.Ephemeral]})

        if (!interaction.memberPermissions?.has("ModerateMembers")) {
            return await interaction.editReply({content: "Você não tem permissão para usar esse comando!"});
        }

        const user = options.getUser("user");
        const reason = options.getString("reason")?? "Sem motivo"

        if (!user) return await interaction.editReply({content: "Usuário inexistente!"})

        const member = await client.getMainGuild()?.members.fetch(user.id).catch(() => null);
        if (!member) return interaction.editReply("Usuário não está no servidor.");

        const warningRepo = database.repositories.get("warnings");

        const warningModel = { id: undefined, user_id: user.id, reason: reason }

        warningRepo?.insert(warningModel).then(async () => {
            member.kick(reason)
            await user.send({
                components: [KickComponent(warningModel)],
                flags: MessageFlags.IsComponentsV2
            })
            return await interaction.editReply({content: `Usuário punido com sucesso! Motivo: **${warningModel.reason}**`});
        }).catch(async err => {
            console.log(err);
            return await interaction.editReply({content: `Erro ao punir usuário!`})
        });
    }
});

