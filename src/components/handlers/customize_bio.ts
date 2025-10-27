import {ModalSubmitHandler} from "../../types/discord/Components";
import {GuildMember, MessageFlags, ModalSubmitInteraction} from "discord.js";
import {getOrCreateProfile, updateProfile} from "../../repositories/profile";

export default class DeleteTicketHandler implements ModalSubmitHandler {
    id = "customize-bio";
    async run(interaction: ModalSubmitInteraction): Promise<void> {

        const member = interaction.member as GuildMember;

        if (!member) return;

        const bio = interaction.fields.getTextInputValue("bio");
        const banner = interaction.fields.getTextInputValue("banner");


        if (!isValidBannerInput(banner)) {
            await interaction.reply("Banner inválido!")
            return
        }

        const isURL = isValidURL(banner);

        getOrCreateProfile(interaction.user.id).then(async profile => {
            if (!profile) return await interaction.reply("Perfil não encontrado.");

            profile.bio = bio;
            profile.profileBgURL = isURL ? banner : undefined;

            profile.profileBgID = isURL ? 1 : Number(banner);

            await updateProfile(interaction.user.id, profile)

            await interaction.reply({content: "Perfil atualizado com sucesso!", flags: MessageFlags.Ephemeral});

        });
    }

}

function isValidBannerInput(input: string): boolean {
    return isValidURL(input) || (/^\d+$/.test(input) && Number(input) >= 1 && Number(input) <= 23);
}

function isValidURL(str: string): boolean {
    const pattern = /^(https?:\/\/[^\s]+)$/i;
    return pattern.test(str);
}
