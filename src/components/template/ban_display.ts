import {
    ContainerBuilder,
    SectionBuilder, SeparatorBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder
} from "discord.js";
import {WarningModel} from "../../types/database/models/WarningModel";

export default function BanComponent(warningModel: WarningModel, days?: number) {


    return new ContainerBuilder()
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("# Você foi banido do servidor!"),
                    new TextDisplayBuilder().setContent("Você só precisava seguir as regras..."),
                    new TextDisplayBuilder().setContent("Tempo do banimento (em dias): " + days)
                )
                .setThumbnailAccessory(new ThumbnailBuilder().setURL("https://cdn-icons-png.flaticon.com/128/5955/5955689.png").setDescription("Ban"))
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Motivo: " + warningModel.reason))
}