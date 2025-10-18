import {
    ContainerBuilder, Message,
    SectionBuilder, SeparatorBuilder, TextChannel,
    TextDisplayBuilder, ThumbnailBuilder,
    User
} from "discord.js";

export default function DeleteMessageLogComponent(user: User | null, message: Message, channel: TextChannel) {
    if (!user) return new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent("Algo deu errado, talvez a mensagem seja muito antiga"));


    const avatarUrl = user.displayAvatarURL({ size: 128, forceStatic: true, extension: "png" });

    const attachments = message.attachments.map(attachment => attachment.url);

    const attachmentComponent = attachments.length > 0 ? new TextDisplayBuilder().setContent(`**Anexos: ${attachments.join(", ")}**`) :
    new TextDisplayBuilder().setContent("Nenhum anexo encontrado");

    return new ContainerBuilder()
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`## Mensagem deletada de ${user.username}`),
                    new TextDisplayBuilder().setContent(`ID/Menção \`${user.id}\` <@${user.id}>`),
                    new TextDisplayBuilder().setContent(`Canal \`${channel.id}\` <#${channel.id}>`),
                )
                .setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarUrl ? avatarUrl : "https://cdn.discordapp.com/embed/avatars/1.png").setDescription("Profile Photo"))
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("## Dados da mensagem"),
            new TextDisplayBuilder().setContent("Data e hora: " + message.createdAt.toLocaleString("pt-BR")),
            new TextDisplayBuilder().setContent(`ID da mensagem: \`${message.id}\``),
            new TextDisplayBuilder().setContent("### Conteúdo"),
            new TextDisplayBuilder().setContent(message.content && message.content.length > 0 ? message.content : "[Mensagem sem conteúdo]")
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(attachmentComponent)
}