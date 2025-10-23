import { Listener } from "../../types/discord/Event";
import { config, state, saveState } from "../../index";
import {TextChannel} from "discord.js";

export default new Listener({
    type: "messageCreate",
    async handle(event): Promise<any> {
        if (event.channel.id !== config.channels.counting_channel) return;

        const content = (event.content || "").trim();
        if (!content) return;

        const current = Number(state.counting_game.current_number ?? 1);
        const top = Number(state.counting_game.top_number ?? 0);

        if (content === String(current)) {
            const reply = await event.reply("✅ Correto").catch(()=>null);
            if (reply) setTimeout(() => reply.delete().catch(()=>{}), 1000);

            const next = current + 1;
            state.counting_game.current_number = next;
            if (next > top) {
                state.counting_game.top_number = current;
                (event.channel as TextChannel).setTopic(`Contagem máxima: ${top}`).catch(err => console.error(err));
            }

            saveState();
            return;
        }

        if (/^\d+$/.test(content)) {
            await event.reply("❌ Errado, jogo reiniciado ao número 0").catch(()=>{});
            await event.react("❌").catch(()=>{});

            state.counting_game.current_number = 1;
            saveState();
            return;
        }
    }
});
