import {ButtonHandler} from "../../types/discord/Components";
import {ButtonInteraction, MessageFlags, TextChannel} from "discord.js";
import {database} from "../../index";
import TicketsRepository from "../../repositories/tickets";

export default class DeleteTicketHandler implements ButtonHandler {
    id = "delete_ticket";

    async run(interaction: ButtonInteraction): Promise<void> {

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

        repo.delete(ticketID).then(async () => {
            await interaction.editReply("Ticket deletado com sucesso! Este canal irá ser deletado em 2 segundos...")
            setTimeout(async () => {
                await channel.delete()
            }, 2000)

        })


    }

}