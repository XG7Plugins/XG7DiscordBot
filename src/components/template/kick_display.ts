import {
    ContainerBuilder,
    SectionBuilder, SeparatorBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder
} from "discord.js";
import {WarningModel} from "../../types/database/models/WarningModel";

export default function KickComponent(warningModel: WarningModel) {


    return new ContainerBuilder()
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("# Você foi expulso do servidor!"),
                    new TextDisplayBuilder().setContent("Você poderá voltar, mas não quebre as regras novamente!")
                )
                .setThumbnailAccessory(new ThumbnailBuilder().setURL("https://cdn-icons-png.flaticon.com/128/5955/5955689.png").setDescription("Warn"))
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Motivo: " + warningModel.reason))
}