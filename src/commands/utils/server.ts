import {Command} from "../../types/discord/Command";
import {MessageFlags, SlashCommandBuilder} from "discord.js";
import ServerComponent from "../../components/template/server";

export default new Command({
    build() {
        return new SlashCommandBuilder()
            .setName("servidor")
            .setDescription("Veja as informações de um servidor")
            .addStringOption(option =>
                option
                    .setName("ip")
                    .setDescription("Nome do servidor")
                    .setRequired(true)
            )
            .addBooleanOption(option =>
                option
                    .setName("bedrock")
                    .setDescription("O servidor é bedrock?")
                    .setRequired(false)
            )
    },

    run: async({ interaction, options }) => {
        await interaction.deferReply({flags: [MessageFlags.Ephemeral]});

        const ip = options.getString("ip", true);
        const bedrock = options.getBoolean("bedrock")?? false;


        fetch(`https://api.mcstatus.io/v2/status/${bedrock ? "bedrock" : "java"}/${ip}`)
            .then(async res => await res.json() as any)
            .then(async res => {

                if (!res.ip_address) {
                    await interaction.editReply("Servidor não encontrado!")
                    return;
                }

                const  component = ServerComponent(res)

                await interaction.followUp({
                    components: component.components,
                    files: component.files,
                    flags: [MessageFlags.IsComponentsV2]
                })

            })
            .catch(async err => {
                console.error("Erro ao buscar servidor:", err);
                await interaction.followUp({
                    content: `⚠️ Erro inesperado: ${err}`,
                    flags: [MessageFlags.Ephemeral],
                });
            });
    }

})