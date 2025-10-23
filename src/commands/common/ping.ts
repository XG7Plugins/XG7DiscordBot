import {Command} from "../../types/discord/Command";
import {MessageFlags} from "discord-api-types/v10";
import {SlashCommandBuilder} from "discord.js";

export default new Command({
    build() {
        return new SlashCommandBuilder()
            .setName("ping")
            .setDescription("Teste de ping!");
    },
    isGlobal: true,
    run: async ({ interaction }) => {
        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

        await interaction.editReply({
            content: "Pong!"
        })
    }
});