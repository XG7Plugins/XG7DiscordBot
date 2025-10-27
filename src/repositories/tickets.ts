import {Repository} from "../types/database/Repository";
import {Ticket} from "../types/database/models/Ticket";
import {client, config, database} from "../index";
import console from "node:console";
import {CloseTicketComponent, TicketComponent} from "../components/template/ticket";
import {GuildMember, MessageFlags, TextChannel} from "discord.js";

export default class TicketsRepository implements Repository<string, Ticket> {
    table = "tickets";
    createTable(): Promise<void> {
        return database.query(
            `CREATE TABLE IF NOT EXISTS ${this.table} (
            id VARCHAR(255) NOT NULL UNIQUE,
            owner_id VARCHAR(255) NOT NULL UNIQUE,
            category ENUM('plugin', 'bug', 'sugestão', 'denúncia', 'outro') NOT NULL,
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
            `INSERT INTO ${this.table} (id, owner_id, category) VALUES (?,?, ?)`,
            [value.id, value.owner_id, value.type]
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
            SET closed = ? WHERE id = ?`,
            [value.closed, value.id]
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
            name: (member.roles.cache.hasAny("1424094092304056492", "1328930300364849203", "1235570566778327152") ? "💎" : "🎟️") + "・ticket-" + member.user.username,
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

export async function closeTicket(interaction: any, member: GuildMember, channel: TextChannel): Promise<void> {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const ticketID = channel.id;
    const repo = database.repositories.get("tickets") as TicketsRepository;

    if (!repo) {
        await interaction.editReply("Erro ao acessar o banco de dados.");
        return;
    }

    try {
        const ticket = await repo.select(ticketID);

        if (!ticket) {
            await interaction.editReply("Ticket não encontrado no banco de dados.");
            return;
        }

        const guild = client.getMainGuild();
        if (!guild) return;

        const owner = await guild.members.fetch(ticket.owner_id).catch(() => null);

        await channel.guild.members.fetch();

        const members = channel.members;

        for (const member of members.values()) {
            if (!channel.permissionsFor(member)?.has("ViewChannel")) continue;
            if (member.roles.cache.has("1364270135564566538")) continue;
            await channel.permissionOverwrites.delete(member.id);
        }

        await channel.send(`🔒 Ticket fechado por ${member.user.tag}. ${owner}, você não tem mais acesso a este canal.`);


        await channel.setName(`❌・closed-${owner ? owner.user.username : "unknown"}`);

        await repo.update({
            ...ticket,
            closed: true
        });

        await channel.send({
            components: [CloseTicketComponent()],
            flags: [MessageFlags.IsComponentsV2]
        })

        interaction.editReply("Ticket fechado com sucesso!")



    } catch (err) {
        console.error("Erro ao fechar o ticket:", err);
        await interaction.editReply("❌ Erro ao fechar o ticket.");
    }
}