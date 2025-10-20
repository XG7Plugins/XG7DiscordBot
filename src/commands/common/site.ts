import {Command} from "../../types/discord/Command";
import { MessageFlags } from "discord.js";
import SiteComponent from "../../components/template/site";

export default new Command({
    data: {
        name: "site",
        description: "Site do XG7Plugins"
    },
    isGlobal: true,

    run({ interaction }) {

        interaction.reply({
            components: [SiteComponent()],
            flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral ],
        });

    }

})