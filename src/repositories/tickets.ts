import {Repository} from "../types/database/Repository";
import {Ticket} from "../types/database/models/Ticket";
import {client, config, database} from "../index";
import console from "node:console";
import {TicketComponent} from "../components/template/ticket";
import {GuildMember, MessageFlags} from "discord.js";

export default class TicketsRepository implements Repository<string, Ticket> {
    table = "tickets";
    createTable(): Promise<void> {
        return database.query(
            `CREATE TABLE IF NOT EXISTS ${this.table} (
            id VARCHAR(255) NOT NULL UNIQUE,
            owner_id VARCHAR(255) NOT NULL UNIQUE,
            category ENUM('plugin', 'bug', 'sugestão', 'denúncia', 'outro') NOT NULL,
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
            `INSERT INTO ${this.table} (id, owner_id, category, added_members) VALUES (?,?, ?, ?)`,
            [value.id, value.owner_id, value.type, '[]']
        )
    }
    async select(id: string): Promise<Ticket | null> {
        const results = await database.query(
            `SELECT * FROM ${this.table} WHERE id = ?`,
            [id]
        );
        const ticket = results[0]?.[0];
        return ticket as Ticket;
    }
    update(value: Ticket): Promise<Ticket> {
        return database.query(
            `UPDATE ${this.table}
            SET added_members = ?, closed = ? WHERE id = ?`,
            [value.added_members, value.closed, value.id]
        )
    }
    delete(id: string): Promise<void> {
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


export async function createTicket(member: GuildMember, type: string): Promise<Ticket | null> {

    const guild = client.getMainGuild();
    if (!guild) return null;

    const repo = database.repositories.get("tickets") as TicketsRepository;
    if (!repo) return null;

    if (await repo.exists(member.id)) {
        return null;
    }

    try {
        const channel = await guild.channels.create({
            name: "🎟️・ticket-" + member.user.username,
            type: 0,
            parent: config.channels.tickets_category,
            topic: `Ticket de <@${member.id}> | Tipo: ${type}`,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: ["ViewChannel"],
                },
                {
                    id: member.id,
                    allow: ["ViewChannel", "SendMessages", "AttachFiles", "ReadMessageHistory"],
                },
                {
                    id: "1364270135564566538",
                    allow: ["ViewChannel", "SendMessages", "AttachFiles", "ReadMessageHistory"],
                }
            ]
        });

        console.log("CHANNEL ID" + channel.id);

        const ticket = {
            id: channel.id,
            owner_id: member.id,
            type: type
        };

        channel.send({
            components: TicketComponent(ticket as Ticket, member),
            flags: [MessageFlags.IsComponentsV2]
        })

        await repo.insert(ticket as Ticket);
        return ticket as Ticket;

    } catch (err) {
        console.log(err);
        return null;
    }
}