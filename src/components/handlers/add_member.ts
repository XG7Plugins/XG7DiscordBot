import {SelectMenuHandler} from "../../types/discord/Components";
import {
    GuildMember,
    MessageFlags, TextChannel,
    UserSelectMenuInteraction
} from "discord.js";
import {database} from "../../index";
import TicketsRepository from "../../repositories/tickets";

export default class AddMemberMenu implements SelectMenuHandler{

    id = "add_member";
    async run(interaction: UserSelectMenuInteraction): Promise<any> {

        const member = interaction.member as GuildMember;

        if (!member) return;

        if (!member.roles.cache.has("1364270135564566538")) {
            await interaction.reply({
                content: "Você não tem permissão para adicionar membros neste ticket.",
                flags: [MessageFlags.Ephemeral]
            });
            return;
        }

        const channel = interaction.channel as TextChannel;
        if (!channel) return;

        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

        const ticketID = channel.id;
        const repo = database.repositories.get("tickets") as TicketsRepository;

        if (!repo) {
            await interaction.editReply("Erro ao acessar o banco de dados.");
            return;
        }
        const ticket = await repo.select(ticketID);

        if (!ticket) {
            await interaction.editReply("Ticket não encontrado no banco de dados.");
            return;
        }

        const membersToAdd = interaction.values;

        repo.update({
            ...ticket,
            added_members: JSON.stringify(membersToAdd)
        }).then(async () => {
            for (const memberId of membersToAdd) {
                await channel.permissionOverwrites.create(
                    memberId,
                    {
                        SendMessages: true,
                        ViewChannel: true,
                        ReadMessageHistory: true,
                        AttachFiles: true,
                        AddReactions: true,
                        UseExternalEmojis: true,
                    }
                )
            }
            await interaction.editReply("Membros adicionados com sucesso!");
        }).catch(async (err) => {
            console.error("Erro ao adicionar membros ao ticket:", err);
            await interaction.editReply("Erro ao adicionar membros ao ticket.");
            return;
        })

    }


}