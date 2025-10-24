import {ButtonHandler} from "../../types/discord/Components";
import {AttachmentBuilder, ButtonInteraction, MessageFlags, TextChannel} from "discord.js";
import {config, database} from "../../index";
import {Ticket} from "../../types/database/models/Ticket";
import TicketsRepository from "../../repositories/tickets";

export default class StoreTicketHandler implements ButtonHandler {
    id = "archive_ticket";

    async run(interaction: ButtonInteraction): Promise<void> {

        const channel = interaction.channel as TextChannel;
        if (!channel) return;

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

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

        const content = await transcript(ticket, channel);
        const buffer = Buffer.from(content, "utf-8");

        const attachment = new AttachmentBuilder(buffer, {
            name: `ticket-${ticket.owner_id}-${Date.now()}.txt`
        });

        const logChannel = interaction.guild?.channels.cache.get(config.channels.log_channel) as TextChannel;
        if (logChannel) {
            await logChannel.send({
                content: `Ticket armazenado (${ticket.id}):`,
                files: [attachment]
            });
        }

        const owner = await interaction.guild?.members.fetch(ticket.owner_id).catch(() => null);
        if (owner) {
            await owner.send({
                content: `Ticket armazenado (${ticket.id}):`,
                files: [attachment]
            });
        }

        await interaction.editReply("Ticket armazenado com sucesso!");

    }

}


async function transcript(ticket: Ticket, channel: TextChannel) {
    // Buscar todas as mensagens do canal
    const messages = await channel.messages.fetch({ limit: 100 });
    const sortedMessages = Array.from(messages.values()).reverse(); // Ordenar do mais antigo ao mais recente

    // Criar o conteúdo do arquivo
    let content = "";

    // Cabeçalho
    content += "═══════════════════════════════════════════════════════════════\n";
    content += `                    TRANSCRIPT DO TICKET                      \n`;
    content += "═══════════════════════════════════════════════════════════════\n\n";
    content += `Canal: #${channel.name} (${channel.id})\n`;
    content += `Categoria: ${ticket.type}\n`;
    content += `Owner: <@${ticket.owner_id}> (${ticket.owner_id})\n`;
    content += `Criado em: ${new Date(ticket.createdAt?? Date.now()).toLocaleString("pt-BR")}\n`;
    content += `Fechado em: ${new Date().toLocaleString("pt-BR")}\n`;
    content += `Total de mensagens: ${sortedMessages.length}\n`;
    content += "\n═══════════════════════════════════════════════════════════════\n\n";

    // Separar mensagens e attachments
    const attachmentsList: string[] = [];

    // Adicionar mensagens
    content += "📝 MENSAGENS:\n\n";

    for (const message of sortedMessages) {
        const author = message.author;
        const timestamp = message.createdAt.toLocaleString("pt-BR");

        content += "───────────────────────────────────────────────────────────────\n";
        content += `👤 ${author.tag} (${author.id})\n`;
        content += `📅 ${timestamp}\n`;
        content += `💬 ${message.content || "[Mensagem sem conteúdo]"}\n`;

        // Se tiver embeds
        if (message.embeds.length > 0) {
            content += `📊 Embeds: ${message.embeds.length}\n`;
        }

        // Se tiver attachments, adicionar à lista separada
        if (message.attachments.size > 0) {
            content += `📎 Anexos: ${message.attachments.size}\n`;

            message.attachments.forEach(attachment => {
                attachmentsList.push(
                    `👤 ${author.tag}\n` +
                    `📅 ${timestamp}\n` +
                    `📎 ${attachment.name}\n` +
                    `🔗 ${attachment.url}\n`
                );
            });
        }

        content += "\n";
    }

    // Adicionar seção de attachments se houver
    if (attachmentsList.length > 0) {
        content += "\n═══════════════════════════════════════════════════════════════\n\n";
        content += "📎 ANEXOS:\n\n";

        attachmentsList.forEach((attach, index) => {
            content += `[${index + 1}]\n${attach}\n`;
        });
    }

    // Rodapé
    content += "═══════════════════════════════════════════════════════════════\n";
    content += `Data de geração: ${new Date().toLocaleString("pt-BR")}\n`;
    content += "═══════════════════════════════════════════════════════════════\n";

    return content;
}