import {Repository} from "../types/database/Repository";
import {Ticket} from "../types/database/models/Ticket";
import {client, config, database} from "../index";
import console from "node:console";

export default class TicketsRepository implements Repository<number, Ticket> {
    table = "tickets";
    createTable(): Promise<void> {
        return database.query(
            `CREATE TABLE IF NOT EXISTS ${this.table} (
            id INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
            owner_id VARCHAR(255) NOT NULL UNIQUE,
            channel_id VARCHAR(255) NOT NULL,
            category ENUM('bug', 'suggestion', 'report', 'other') NOT NULL,
            added_members MEDIUMTEXT NOT NULL,
            closed BOOLEAN NOT NULL DEFAULT FALSE,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(id)
            )`,
            []
        ).then(result => {
            console.log("Tabela tickets criada com sucesso!".green);
        });
    }
    insert(value: Ticket): Promise<void> {
        return database.query(
            `INSERT INTO ${this.table} (owner_id, channel_id, category, added_members) VALUES (?, ?, ?, ?)`,
            [value.owner_id, value.channel_id, value.type, '[]']
        )
    }
    select(id: number): Promise<Ticket> {
        return database.query(
            `SELECT * FROM ${this.table} WHERE id = ?`,
            [id]

        )
    }
    update(value: Ticket): Promise<Ticket> {
        return database.query(
            `UPDATE ${this.table} (added_members, closed) 
            SET added_members = ?, closed = ? WHERE id = ?`,
            [value.added_members, value.closed, value.id]
        )
    }
    delete(id: number): Promise<void> {
        return database.query(
            `DELETE FROM ${this.table} WHERE id = ?`,
            [id]
        )
    }
    async exists(owner_id: string): Promise<boolean> {
        try {
            const results = await database.query(
                `SELECT *
                 FROM ${this.table}
                 WHERE owner_id = ?`,
                [owner_id]
            );
            return results[0].length > 0;
        } catch (err) {
            return false;
        }
    }
}


export async function createTicket(owner_name: string, owner_id: string, type: string): Promise<Ticket | null> {

    const guild = client.getMainGuild();
    if (!guild) return null;

    const repo = database.repositories.get("tickets") as TicketsRepository;
    if (!repo) return null;

    if (await repo.exists(owner_id)) {
        return null;
    }

    try {
        const channel = await guild.channels.create({
            name: "ticket-" + owner_name,
            type: 0,
            parent: config.channels.tickets_category,
            topic: `Ticket de <@${owner_id}> | Tipo: ${type}`,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: ["ViewChannel"],
                },
                {
                    id: owner_id,
                    allow: ["ViewChannel", "SendMessages", "AttachFiles", "ReadMessageHistory"],
                }
            ]
        });

        console.log("CHANNEL ID" + channel.id);

        const ticket = {
            owner_id: owner_id,
            channel_id: channel.id,
            type: type
        };

        await repo.insert(ticket as Ticket);
        return ticket as Ticket;

    } catch (err) {
        console.log(err);
        return null;
    }
}