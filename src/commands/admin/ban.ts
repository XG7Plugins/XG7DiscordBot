import {Command} from "../../types/discord/Command";
import {MessageFlags, PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {client, database} from "../../index";
import console from "node:console";
import BanComponent from "../../components/template/ban_display";
import {InteractionContextType} from "discord-api-types/v10";

export default new Command({
    build() {
        return new SlashCommandBuilder()
            .setName("ban")
            .setDescription("Bane membros")
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
            .setContexts(InteractionContextType.Guild)
            .addUserOption(option =>
                option
                    .setName("user")
                    .setDescription("Usuário a ser banido")
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option
                    .setName("tempo")
                    .setDescription("Tempo do banimento (em dias)")
                    .setRequired(false)
            )
            .addStringOption(option =>
                option
                    .setName("reason")
                    .setDescription("Razão da expulsão")
                    .setRequired(false)
            );
    },
    run: async ({ interaction, options }) => {

        await interaction.deferReply({flags: [MessageFlags.Ephemeral]})

        if (!interaction.memberPermissions?.has("ModerateMembers")) {
            return await interaction.editReply({content: "Você não tem permissão para usar esse comando!"});
        }

        const user = options.getUser("user", true);
        const days = options.getInteger("tempo")
        const reason = options.getString("reason")?? "Sem motivo"


        const member = await client.getMainGuild()?.members.fetch(user.id).catch(() => null);
        if (!member) return interaction.editReply("Usuário não está no servidor.");

        const warningRepo = database.repositories.get("warnings");

        const warningModel = { id: undefined, user_id: user.id, reason: reason }

        warningRepo?.insert(warningModel).then(async () => {
            member.ban({
                reason: reason,
                deleteMessageDays: !days ? undefined : days
            })
            await user.send({
                components: [BanComponent(warningModel, !days ? undefined : days)],
                flags: MessageFlags.IsComponentsV2
            })
            return await interaction.editReply({content: `Usuário punido com sucesso! Motivo: **${warningModel.reason}**`});
        }).catch(async err => {
            console.log(err);
            return await interaction.editReply({content: `Erro ao punir usuário!`})
        });
    }
});

