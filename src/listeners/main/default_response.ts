import {Listener} from "../../types/Event";
import { config } from "../.."
import {OmitPartialGroupDMChannel} from "discord.js";


export default new Listener({
    type: "messageCreate",
    handle(message: OmitPartialGroupDMChannel<any>): any {
        if (message.author.bot || message.author.id === config.bot_id) return;
        if (!message.content.includes(`<@${config.bot_id}>`)) return;

        message.reply({
            content: `Olá, ${message.author.username}. Sou o robô desse servidor, com o intuito de dar suporte a vocês! Infelizmente não posso atuar mais como uma IA generativa, mas quando eu obtiver suporte eu responderei todas as suas perguntas!`,
        })

    }
})