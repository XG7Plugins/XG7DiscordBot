import {Command} from "../../types/Command";
import {PermissionsBitField} from "discord.js";

export default new Command({
    data: {
        name: "ping",
        description: "Teste de ping!",
        defaultMemberPermissions: [PermissionsBitField.Flags.Administrator]
    },
    isGlobal: true,
    run: ({ interaction }) => {

        interaction.reply({
            content: "Pong!"
        })


    }
});