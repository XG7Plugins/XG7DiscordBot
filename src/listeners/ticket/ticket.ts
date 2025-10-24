import {Listener} from "../../types/discord/Event";
import {database} from "../../index";
import TicketsRepository from "../../repositories/tickets";

export default new Listener({
    type: "messageCreate",
    handle(message): any {
        const ticketID = message.channel.id;

        const repo = database.repositories.get("tickets") as TicketsRepository;

        if (!repo) return;

        if (message.author.bot) return

        const author = message.author;

        repo.select(ticketID).then(async ticket => {
            if (!ticket) return;


            const newMessage = await message.channel.send({content: author.id === ticket.owner_id ? "<@&1364270135564566538>" : "<@" + ticket.owner_id + ">"})

            setTimeout(() => {
                newMessage.delete()
            }, 2000);

            return;

        })

    }
})