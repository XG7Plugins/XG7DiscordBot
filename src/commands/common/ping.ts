import {Command} from "../../types/discord/Command";
import {MessageFlags} from "discord-api-types/v10";

export default new Command({
    data: {
        name: "ping",
        description: "Teste de ping!"
    },
    isGlobal: true,
    run: async ({ interaction }) => {
        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

        await interaction.editReply({
            content: "Pong!"
        })
    }
});