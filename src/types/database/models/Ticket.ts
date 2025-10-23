export type Ticket = {
    id: number | undefined;
    owner_id: string;
    channel_id: string;
    added_members: string[] | [];
    closed: boolean | undefined;
    type: TicketType;

    createdAt: Date | undefined;
}

export type TicketType = "bug" | "suggestion" | "report" | "other";

