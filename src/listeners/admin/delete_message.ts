import {Listener} from "../../types/discord/Event";
import { client, config } from "../../index";
import {Message, MessageFlags, TextChannel} from "discord.js";
import DeleteMessageLogComponent from "../../components/template/delete_message";

export default new Listener({
    type: "messageDelete",
    handle(event): any {

        const channel = client.getMainGuild()?.channels.cache.get(config.channels.log_channel) as TextChannel;

        if (!channel) return;

        channel.send({
            components: [DeleteMessageLogComponent(event.author, event as Message, event.channel as TextChannel)],
            flags: [MessageFlags.IsComponentsV2],

        });


    }

})