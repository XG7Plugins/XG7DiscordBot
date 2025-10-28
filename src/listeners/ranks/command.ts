import {Listener} from "../../types/discord/Event";
import {client} from "../../index";
import {addXP, getOrCreateProfile} from "../../repositories/profile";

export default new Listener({
    type: "interactionCreate",
    async handle(interaction) {

        if (!interaction.isCommand()) return

        const guild = client.getMainGuild();

        if (!guild) return

        const user = interaction.user;

        if (user.bot) return;

        const member = guild.members.cache.get(user.id)
            || await guild.members.fetch(user.id).catch(() => null);

        if (!member) return;

        getOrCreateProfile(member.id).then(async profile => {
            if (!profile) return

            await addXP(member, profile, 40)
        })

    }

})