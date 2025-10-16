import {Command} from "../../types/Command";
import {
    ButtonBuilder,
    ContainerBuilder, MessageFlags, SectionBuilder, SeparatorBuilder, TextDisplayBuilder,
    ThumbnailBuilder, ButtonStyle

} from "discord.js";

export default new Command({
    data: {
        name: "site",
        description: "Site do XG7Plugins"
    },
    isGlobal: true,

    run({ interaction }) {


        const thumbSection = new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent("Veja o Site do XG7Plugins!"))
            .setThumbnailAccessory(new ThumbnailBuilder().setURL("https://xg7plugins.com/images/logo.png").setDescription("BUIOFSDA"))
        const buttonSection = new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent("Entre no link: "))
            .setButtonAccessory(new ButtonBuilder().setURL("https://xg7plugins.com/").setLabel("XG7Plugins").setStyle(ButtonStyle.Link))

        const container = new ContainerBuilder()
            .addSectionComponents(thumbSection)
            .addSeparatorComponents(new SeparatorBuilder())
            .addSectionComponents(buttonSection)

        interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

    }

})