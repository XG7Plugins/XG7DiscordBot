import {Command} from "../../types/Command";

export default new Command({
    data: {
        name: "ping",
        description: "Teste de ping!"
    },
    run: ({ interaction }) => {

        interaction.reply({
            content: "Pong!"
        })


    }
});