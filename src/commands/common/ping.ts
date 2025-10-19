import {Command} from "../../types/Command";
import {MessageFlags, PermissionsBitField} from "discord.js";

export default new Command({
    data: {
        name: "ping",
        description: "Teste de ping!",
    },
    run: ({ interaction }) => {

        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "Você não tem permissão para usar esse comando!",
                flags: [MessageFlags.Ephemeral],
            });
        }

        interaction.reply({
            content: "Pong!"
        })


    }
});