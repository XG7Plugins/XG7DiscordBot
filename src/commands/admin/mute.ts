import {Command} from "../../types/discord/Command";
import {ApplicationCommandOptionType, MessageFlags} from "discord.js";
import {client, database} from "../../index";
import console from "node:console";
import MuteComponent from "../../components/template/mute_display";

export default new Command({
    data: {
        name: "timeout",
        description: "Silencia membros",
        defaultMemberPermissions: ["Administrator"],
        dmPermission: false,
        options: [
            {
                name: "user",
                description: "Usuário a ser silenciado",
                type: ApplicationCommandOptionType.User,
                required: true
            },
            {
                name: "tempo",
                description: "Tempo do silenciamento",
                type: ApplicationCommandOptionType.Integer,
                required: true
            },
            {
                name: "reason",
                description: "Razão do silenciamento",
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

        const user = options.getUser("user", true);
        const time = options.getInteger("tempo", true)
        const reason = options.getString("reason")?? "Sem motivo"


        const member = await client.getMainGuild()?.members.fetch(user.id).catch(() => null);
        if (!member) return interaction.editReply("Usuário não está no servidor.");

        const warningRepo = database.repositories.get("warnings");

        const warningModel = { id: undefined, user_id: user.id, reason: reason }

        warningRepo?.insert(warningModel).then(async () => {
            member.timeout(time * 60 * 1000, reason)
            await user.send({
                components: [MuteComponent(warningModel, time)],
                flags: MessageFlags.IsComponentsV2
            })
            return await interaction.editReply({content: `Usuário punido com sucesso! Motivo: **${warningModel.reason}**`});
        }).catch(async err => {
            console.log(err);
            return await interaction.editReply({content: `Erro ao punir usuário!`})
        });
    }
});

