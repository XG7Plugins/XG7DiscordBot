import {Listener} from "../../types/discord/Event";
import {digitGame} from "../.."

const commands = [
    "start",
    "stop"
]

export default new Listener({
    type: "messageCreate",
    async handle(message): Promise<any> {
        if (message.channel.id !== "1432827347710644425") return;

        if (!message.member) return
        if (message.author.bot) return

        if (message.content.startsWith("dg.")) {

            const command = message.content.slice(3).trim().toLowerCase();

            if (!commands.includes(command)) {
                message.reply({content: `Comando inválido. Os comandos disponíveis são: ${commands.map(c => `\`dg.${c}\``).join(", ")}.`})
                return;
            }

            switch (command) {
                case "start":
                    if (digitGame.gameState) {
                        message.reply("O jogo já está em andamento!")
                    }
                    await digitGame.startGame()
                    return
                case "stop":
                    if (!message.member!.permissions.has("Administrator")) {
                        message.reply("Você não tem permissão para parar o jogo!")
                        return
                    }
                    await digitGame.finishGame(true)
                    return
            }

        }

        if (!digitGame.gameState) {
            message.reply({content: `Os comandos disponíveis são: ${commands.map(c => `\`dg.${c}\``).join(", ")}.`})
            return;
        }

        await digitGame.guess(message.content, message.member!)


    }
})