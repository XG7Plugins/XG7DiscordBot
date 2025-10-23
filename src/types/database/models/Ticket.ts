export type Ticket = {
    id: string;
    owner_id: string;
    added_members: string[] | [];
    closed: boolean | undefined;
    type: TicketType;

    createdAt: Date | undefined;
}

export type TicketBackup = {
    id: string;
    owner: string;

}

export type TicketType = "plugin" | "bug" | "sugestão" | "denúncia" | "outro";

