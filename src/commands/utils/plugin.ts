import {Command} from "../../types/Command";
import {ApplicationCommandOptionType, MessageFlags} from "discord.js";
import {Plugin} from "../../types/internet/Plugin";
import PluginComponent from "../../components/template/plugin";

export default new Command({
    data: {
        name: "ver-plugin",
        description: "Veja as descrições de um plugin",
        options: [
            {
                name: "name",
                description: "Nome do plugin",
                type: ApplicationCommandOptionType.String,
                required: false,
            },
            {
                name: "id",
                description: "ID do plugin",
                type: ApplicationCommandOptionType.Integer,
                required: false,
            }
        ]
    },
    isGlobal: true,

    run({ interaction, options }) {

        const name = options.getString("name");
        const id = options.getInteger("id");

        if (!name && !id) {
            return interaction.reply({
                content: "❌ Você precisa informar **nome** ou **ID** do plugin.",
                flags: [MessageFlags.Ephemeral]
            });
        }

        const pluginByName = !id;

        fetch("https://api.xg7plugins.com/plugins/" + (pluginByName ? "name" : "id") + "/" + (pluginByName ? name : id)).then(res => res.json()).then(data => {

            const plugin = data as Plugin;
            interaction.reply({
                components: [PluginComponent(plugin)],
                flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
            });

        })
    }

})