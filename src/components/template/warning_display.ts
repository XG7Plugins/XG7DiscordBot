import {
    ContainerBuilder,
    SectionBuilder, SeparatorBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder
} from "discord.js";
import {WarningModel} from "../../types/database/models/WarningModel";

export default function WarningComponent(warningModel: WarningModel) {


    return new ContainerBuilder()
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("# Você recebeu um aviso de um administrador!"),
                    new TextDisplayBuilder().setContent("Siga corretamente as regras para não ser punido mais uma vez!")
                )
                .setThumbnailAccessory(new ThumbnailBuilder().setURL("https://cdn-icons-png.flaticon.com/128/5955/5955689.png").setDescription("Warn"))
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("Motivo: " + warningModel.reason))
}