import {
    ActionRowBuilder,
    ContainerBuilder,
    SectionBuilder, SeparatorBuilder,
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
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
                new TextDisplayBuilder().setContent("Precisa de ajuda com algum plugin ou algo do servidor? Abra um ticket agora!")
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
                                    .setLabel("Reportar um bug")
                                    .setDescription("Encontrou um bug no plugin ou no servidor! Reporte-nos!")
                                    .setValue("bug")
                                    .setEmoji({
                                        name: "♨️",
                                    }),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Sugestão")
                                    .setValue("suggestion")
                                    .setDescription("Quer recomendar um novo recurso para o servidor! Deixe-nos saber!")
                                    .setEmoji({
                                        name: "💡",
                                    }),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Denúncia")
                                    .setValue("report")
                                    .setDescription("Quer denunciar algum membro que esteja quebrando as regras! Avise-nos!")
                                    .setEmoji({
                                        name: "🚫",
                                    }),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel("Outro")
                                    .setValue("other")
                                    .setDescription("Precisa de algo mais específico? Contate-nos")
                                    .setEmoji({
                                        name: "📝",
                                    })
                            ),
                    )
            )
    ]

}

function TicketComponent(ticket: Ticket) {

    return new ContainerBuilder()

}