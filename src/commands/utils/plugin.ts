import {Command} from "../../types/discord/Command";
import {MessageFlags, SlashCommandBuilder} from "discord.js";
import {Plugin} from "../../types/internet/Plugin";
import PluginComponent from "../../components/template/plugin";

export default new Command({
    build() {
        return new SlashCommandBuilder()
            .setName("ver-plugin")
            .setDescription("Veja as descrições de um plugin")
            .addStringOption(option =>
                option
                    .setName("name")
                    .setDescription("Nome do plugin")
                    .setRequired(false)
            )
            .addIntegerOption(option =>
                option
                    .setName("id")
                    .setDescription("ID do plugin")
                    .setRequired(false)
            );
    },

    isGlobal: true,

    run: async({ interaction, options }) => {
        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

        const name = options.getString("name");
        const id = options.getInteger("id");

        if (!name && !id) {
            return await interaction.editReply({content: "❌ Você precisa informar **nome** ou **ID** do plugin."});
        }

        const pluginByName = !id;

        fetch("https://api.xg7plugins.com/plugins/" + (pluginByName ? "name" : "id") + "/" + (pluginByName ? name : id))
            .then(async res => {
                if (!res.ok) {
                    return await interaction.editReply({content: `❌ Erro ao buscar plugin (${res.status})`,});
                }

                const data = await res.json();
                const plugin = data as Plugin;

                await interaction.followUp({
                    components: [PluginComponent(plugin)],
                    flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
                });
            })
            .catch(async err => {
                await interaction.followUp({
                    content: `⚠️ Erro inesperado: ${err}`,
                    flags: [MessageFlags.Ephemeral],
                });
            });
    }

})