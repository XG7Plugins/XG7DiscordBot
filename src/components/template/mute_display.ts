import {
    ContainerBuilder,
    SectionBuilder, SeparatorBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder
} from "discord.js";
import {WarningModel} from "../../types/database/models/WarningModel";

export default function MuteComponent(warningModel: WarningModel, time: number) {


    return new ContainerBuilder()
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("# Você foi silenciado!"),
                    new TextDisplayBuilder().setContent("Você ficará proibido de falar por algum tempo"),
                    new TextDisplayBuilder().setContent("Tempo do silenciamento (em minutos): " + time)
                )
                .setThumbnailAccessory(new ThumbnailBuilder().setURL("https://cdn-icons-png.flaticon.com/128/5955/5955689.png").setDescription("Ban"))
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Motivo: " + warningModel.reason))
}