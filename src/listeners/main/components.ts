import {Listener} from "../../types/discord/Event";
import {client} from "../../index";

export default new Listener({
    type: "interactionCreate",
    handle(interaction): any {

        if (!(interaction.isButton() || interaction.isModalSubmit() || interaction.isAnySelectMenu())) return;

        const component = client.componentHandlers.get(interaction.customId)

        if (!component) return;

        component.run(interaction);
    }

})