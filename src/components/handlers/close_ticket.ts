import {
    ButtonInteraction,
    GuildMember,
    MessageFlags, TextChannel,
} from "discord.js";
import {ButtonHandler} from "../../types/discord/Components";
import {closeTicket} from "../../repositories/tickets";

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

        const channel = interaction.channel;
        if (!channel) return;

        await closeTicket(interaction, member, channel as TextChannel)

    }

}

