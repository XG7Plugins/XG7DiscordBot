import {Listener} from "../../types/discord/Event";
import {config} from "../../index";
import {EmojiIdentifierResolvable} from "discord.js";

export default new Listener({
    type: "messageCreate",
    async handle(event): Promise<any> {

        for (const [key, emoji] of Object.entries(config.random_reactions)) {
            if (event.cleanContent.toLowerCase().includes(key.toLowerCase())) {
                try {
                    await event.react(emoji as EmojiIdentifierResolvable);
                } catch (err) {
                    console.error(`Erro ao reagir com ${emoji}:`, err);
                }
            }
        }

    }
})