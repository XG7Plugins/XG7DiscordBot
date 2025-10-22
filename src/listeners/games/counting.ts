import {Listener} from "../../types/discord/Event";
import {config} from "../../index";


let count = 1;

export default new Listener({
    type: "messageCreate",
    async handle(event): Promise<any> {

        if (event.channel.id !== config.channels.counting_channel) return;

        if (event.content === count.toString()) {
            const reply = await event.reply("✅ Correto")
            setTimeout(async () => await reply.delete(), 1000)

            count++;
            return;
        }

        if (event.content.match(/^\d+$/)) {
            await event.reply("❌ Errado, jogo reiniciado ao número 0")
            await event.react("❌")
            return count = 1;
        }


    }
})