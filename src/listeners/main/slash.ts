import { client } from "../..";
import {Listener} from "../../types/discord/Event";
import {CommandInteractionOptionResolver} from "discord.js";

export default new Listener({
    type: "interactionCreate",
    handle(interaction: any): any {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        const options = interaction.options as CommandInteractionOptionResolver;

        command.declaration.run({ client, interaction, options });
    }
});