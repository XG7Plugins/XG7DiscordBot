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

        fetch("https://api.xg7plugins.com/plugins/" + (pluginByName ? "name" : "id") + "/" + (pluginByName ? name : id))
            .then(async res => {
                if (!res.ok) {
                    return interaction.reply({
                        content: `❌ Erro ao buscar plugin (${res.status})`,
                        flags: [MessageFlags.Ephemeral],
                    });
                }

                const data = await res.json();
                const plugin = data as Plugin;

                await interaction.reply({
                    components: [PluginComponent(plugin)],
                    flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
                });
            })
            .catch(err => {
                interaction.reply({
                    content: `⚠️ Erro inesperado: ${err}`,
                    flags: [MessageFlags.Ephemeral],
                });
            });
    }

})