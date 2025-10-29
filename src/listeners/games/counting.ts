import {Listener} from "../../types/discord/Event";
import {config, saveState, state} from "../../index";
import {Message, TextChannel} from "discord.js";

class MessageQueue {
    private queue: Message[] = [];
    private processing = false;

    async add(message: Message) {
        this.queue.push(message);
        if (!this.processing) {
            await this.process();
        }
    }
    private async process() {
        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }

        this.processing = true;
        const message = this.queue.shift()!;

        try {
            await processCountingMessage(message);
        } catch (error) {
            console.error("Erro ao processar mensagem de contagem:", error);
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        await this.process();
    }

    clear() {
        this.queue = [];
        this.processing = false;
    }
}

const countingQueue = new MessageQueue();

function extractNumbers(content: string): number[] {
    const normalized = content.replace(/\s+/g, ' ').trim();

    return normalized
        .split(/[\s,;\n]+/)
        .map(s => s.trim())
        .filter(s => /^\d+$/.test(s))
        .map(Number);
}

function isValidSequence(numbers: number[], startFrom: number): boolean {
    if (numbers.length === 0) return false;

    if (numbers[0] !== startFrom) return false;

    for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] !== numbers[i - 1] + 1) {
            return false;
        }
    }
    return true;
}

async function processCountingMessage(event: Message) {
    const content = (event.content || "").trim();
    if (!content) return;

    const current = Number(state.counting_game.current_number ?? 1);
    const top = Number(state.counting_game.top_number ?? 0);

    const numbers = extractNumbers(content);

    if (numbers.length === 0) return;

    if (isValidSequence(numbers, current)) {
        const count = numbers.length;
        const lastNumber = numbers[numbers.length - 1];

        const msg = count === 1
            ? "✅ Correto"
            : `🔥 Combo de ${count} números!`;

        const reply = await event.reply(msg).catch(() => null);
        if (reply) setTimeout(() => reply.delete().catch(() => {}), 2000);

        const next = lastNumber + 1;
        state.counting_game.current_number = next;

        if (next > top) {
            state.counting_game.top_number = next;
            (event.channel as TextChannel)
                .setTopic(`Contagem recorde: ${next - 1}`)
                .catch(err => console.error(err));
        }

        saveState();
        return;
    }

    await event.reply(`❌ Errado! Esperava começar com ${current}. Jogo reiniciado ao número 0`).catch(() => {});
    await event.react("❌").catch(() => {});

    state.counting_game.current_number = 1;
    saveState();

    countingQueue.clear();
    return;
}

export default new Listener({
    type: "messageCreate",
    async handle(event): Promise<any> {
        if (event.channel.id !== config.channels.counting_channel) return;
        if (event.author.bot) return;

        await countingQueue.add(event);
    }
});