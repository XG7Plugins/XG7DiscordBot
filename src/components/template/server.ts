import {
    AttachmentBuilder,
    ContainerBuilder,
    SectionBuilder,
    SeparatorBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder
} from "discord.js";


export default function ServerComponent(res: any) {
    let file: AttachmentBuilder | undefined;
    let thumbnailUrl: string | undefined;

    if (res.icon?.startsWith("data:image")) {
        const base64 = res.icon.split(",")[1];
        const buffer = Buffer.from(base64, "base64");
        file = new AttachmentBuilder(buffer, { name: "server_icon.png" });
        thumbnailUrl = "attachment://server_icon.png";
    }

    const online = res.online === true;

    const titleSection = new SectionBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# Servidor: ${res.host}`),
        new TextDisplayBuilder().setContent(online ? "🟢 **Online**" : "🔴 **Offline**"),
        new TextDisplayBuilder().setContent(`IP: \`${res.ip_address}:${res.port}\``)
    ).setThumbnailAccessory(
        new ThumbnailBuilder()
            .setURL(thumbnailUrl ? thumbnailUrl : "https://imgs.search.brave.com/_OV3V3pyzeeUI8ZAtUrwEsLQVZhVZtxc5kshw-qbZuc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zLnBu/Z2tpdC5jb20vcG5n/L3NtYWxsLzI3NC0y/NzQyOTMzX21pbmVj/cmFmdC1ncmFzcy1i/bG9jay1waXhlbC1k/ZXRhaWwtbWluZWNy/YWZ0LWdyYXNzLWJs/b2NrLnBuZw")
            .setDescription("Ícone do servidor")
    );

    const infoSection = [];
    if (online) {
        infoSection.push(
            new TextDisplayBuilder().setContent(`Versão: **${res.version?.name_clean || "Desconhecida"}**`),
            new TextDisplayBuilder().setContent(`Jogadores: **${res.players?.online || 0}/${res.players?.max || 0}**`),
            new TextDisplayBuilder().setContent(`Motd: ${res.motd?.clean?.replace(/\n/g, " ") || "Sem mensagem"}`)
        );
    } else {
        infoSection.push(
            new TextDisplayBuilder().setContent("O servidor está offline ou não respondeu à consulta.")
        );
    }

    return {
        components: [
            new ContainerBuilder()
                .addSectionComponents(titleSection)
                .addSeparatorComponents(new SeparatorBuilder())
                .addTextDisplayComponents(infoSection)
        ],
        files: file ? [file] : []
    };
}