import {
    ButtonInteraction,
    GuildMember,
    MessageFlags,
    TextChannel,
} from "discord.js";
import {ButtonHandler} from "../../types/discord/Components";
import {client, database} from "../../index";
import TicketsRepository from "../../repositories/tickets";
import {CloseTicketComponent} from "../template/ticket";

export default class DeleteTicketHandler implements ButtonHandler {
    id = "close_ticket";
    async run(interaction: ButtonInteraction): Promise<void> {

        const member = interaction.member as GuildMember;

        if (!member) return;

        if (!member.roles.cache.has("1364270135564566538")) {
            await interaction.reply({
                content: "Você não tem permissão para fechar este ticket.",
                flags: [MessageFlags.Ephemeral]
            });
            return;
        }

        const channel = interaction.channel as TextChannel;
        if (!channel) return;

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const ticketID = channel.id;
        const repo = database.repositories.get("tickets") as TicketsRepository;

        if (!repo) {
            await interaction.editReply("Erro ao acessar o banco de dados.");
            return;
        }

        try {
            const ticket = await repo.select(ticketID);

            if (!ticket) {
                await interaction.editReply("Ticket não encontrado no banco de dados.");
                return;
            }

            const guild = client.getMainGuild();
            if (!guild) return;

            const owner = await guild.members.fetch(ticket.owner_id).catch(() => null);

            const membersToRemove: string[] = [ticket.owner_id];

            const arrayedMembers = JSON.parse(ticket.added_members);

            if (ticket.added_members && Array.isArray(arrayedMembers)) {
                membersToRemove.push(...arrayedMembers);
            }

            for (const memberId of membersToRemove) {
                await channel.permissionOverwrites.delete(memberId);
            }

            if (owner) {
                await channel.send(`🔒 Ticket fechado por ${member.user.tag}. ${owner}, você não tem mais acesso a este canal.`);
            }

            await channel.setName(`🎟️・closed-${owner ? owner.user.username : "unknown"}`);

            await repo.update({
                ...ticket,
                closed: true
            });

            await channel.send({
                components: [CloseTicketComponent()],
                flags: [MessageFlags.IsComponentsV2]
            })

            interaction.editReply("Ticket fechado com sucesso!")



        } catch (err) {
            console.error("Erro ao fechar o ticket:", err);
            await interaction.editReply("❌ Erro ao fechar o ticket.");
        }
    }

}