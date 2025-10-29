import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    GuildMember,
    SectionBuilder,
    SeparatorBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder
} from "discord.js";
import {Ticket} from "../../types/database/models/Ticket";

export function SetupTicketComponent() {

    return [
        new ContainerBuilder()
        .addSectionComponents(new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("# Abra um ticket"),
                new TextDisplayBuilder().setContent("Precisa de ajuda com algum plugin ou algo do servidor? Abra um ticket agora!"),
                new TextDisplayBuilder().setContent("Se abrir um ticket sem motivo, pode ser considerado off topic e terá punição!"),
            )
            .setThumbnailAccessory(new ThumbnailBuilder().setURL("https://cdn-icons-png.flaticon.com/128/6030/6030249.png").setDescription("Tickets"))
        )
            .addSeparatorComponents(new SeparatorBuilder())
            .addActionRowComponents(
                new ActionRowBuilder<StringSelectMenuBuilder>()
                    .setComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId("create_ticket_menu")
                            .setPlaceholder("Selecione o tipo de ticket que deseja abrir")
                            .setRequired(true)
                            .addOptions(
                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Suporte a plugin")
                                    .setDescription("Quer ajuda com algum plugin? Podemos ajudar!")
                                    .setValue("plugin")
                                    .setEmoji({
                                        name: "🔌",
                                    }),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Reportar um bug")
                                    .setDescription("Encontrou um bug no plugin ou no servidor? Reporte-nos!")
                                    .setValue("bug")
                                    .setEmoji({
                                        name: "♨️",
                                    }),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Sugestão")
                                    .setValue("sugestao")
                                    .setDescription("Quer recomendar um novo recurso para o servidor? Deixe-nos saber!")
                                    .setEmoji({
                                        name: "💡",
                                    }),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Denúncia")
                                    .setValue("denuncia")
                                    .setDescription("Quer denunciar algum membro que esteja quebrando as regras? Avise-nos!")
                                    .setEmoji({
                                        name: "🚫",
                                    }),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Aplicação")
                                    .setValue("aplicacao")
                                    .setDescription("Quer aplicar para ser desenvolvedor verificado no servidor? Crie este ticket!")
                                    .setEmoji({
                                        name: "⚒️",
                                    }),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Outro")
                                    .setValue("outro")
                                    .setDescription("Precisa de algo mais específico? Contate-nos")
                                    .setEmoji({
                                        name: "📝",
                                    })
                            ),
                    )
            )
    ]

}

export function TicketComponent(ticket: Ticket, member: GuildMember) {

    return [new ContainerBuilder()
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("# Ticket de <@" + ticket.owner_id + ">"),
                    new TextDisplayBuilder().setContent("Tipo: " + ticket.type),
                    new TextDisplayBuilder().setContent("Espere uma pessoa da equipe para discutir!")
                )
                .setThumbnailAccessory(new ThumbnailBuilder().setURL(member.user.avatarURL({size: 128, forceStatic: true})?? "https://cdn.discordapp.com/embed/avatars/4.png").setDescription("Profile"))
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>()
                .setComponents(
                    new ButtonBuilder()
                        .setCustomId("add_member_button")
                        .setLabel("Adicionar membros")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId("close_ticket")
                        .setLabel("❌ Fechar ticket")
                        .setStyle(ButtonStyle.Danger)

                )
        ),
        new TextDisplayBuilder().setContent("<@" + member.id + ">, <@&1364270135564566538>")
    ]

}

export function CloseTicketComponent() {
    return new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("### O que você quer fazer com o ticket?"))
        .addSeparatorComponents(new SeparatorBuilder())
        .addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setEmoji("🗑️")
                        .setLabel("Excluir Ticket")
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId("delete_ticket"),
                    new ButtonBuilder()
                        .setEmoji("📥")
                        .setLabel("Arquivar Ticket")
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId("archive_ticket"

                        ))
        )
}
