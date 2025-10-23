import {MessageFlags, StringSelectMenuInteraction} from "discord.js";
import {SelectMenuHandler} from "../../types/discord/Components";
import {TicketType} from "../../types/database/models/Ticket";
import {createTicket} from "../../repositories/tickets";

export default class CreateTicketHandler implements SelectMenuHandler {
    id = "create_ticket_menu";
    async run(interaction: StringSelectMenuInteraction): Promise<void> {

        const selected = interaction.values[0];

        const type = selected as TicketType;

        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

        createTicket(<string>interaction.member?.user.username, <string>interaction.member?.user.id, type).then(async (ticket) => {

            if (!ticket) {
                await interaction.editReply({content: `❌ ERRO. Já tem um ticket aberto em seu nome!`})
                return;

            }

            await interaction.editReply({content: `Seu ticket foi criado: <#${ticket?.channel_id}>`})

        })
    }

}