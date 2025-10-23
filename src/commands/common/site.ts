import {Command} from "../../types/discord/Command";
import {MessageFlags, SlashCommandBuilder} from "discord.js";
import SiteComponent from "../../components/template/site";

export default new Command({
    build() {
        return new SlashCommandBuilder()
            .setName("site")
            .setDescription("Site do XG7Plugins");
    },
    isGlobal: true,

    async run({ interaction }) {

        await interaction.reply({
            components: [SiteComponent()],
            flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral ],
        });

    }

})