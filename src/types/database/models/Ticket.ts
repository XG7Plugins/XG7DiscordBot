export type Ticket = {
    id: string;
    owner_id: string;
    closed: boolean | undefined;
    type: TicketType;

    createdAt: Date | undefined;
}

export type TicketType = "plugin" | "bug" | "sugestao" | "denuncia" | "aplicacao" | "outro";

