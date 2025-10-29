import {Listener} from "../../types/discord/Event";
import {addXP, getOrCreateProfile, updateProfile} from "../../repositories/profile";
import {awardAchievementToProfile} from "../../repositories/profile_achievements";
import {AchievementID, getAchievement} from "../../types/database/models/Achievements";

export default new Listener({
    type: "messageCreate",
    async handle(message): Promise<any> {

        const profile = await getOrCreateProfile(message.author.id);

        if (!profile) return

        const member = message.guild?.members.cache.get(message.author.id)
            || await message.guild?.members.fetch(message.author.id).catch(() => null);

        if (!member) return;
        if (member.user.bot) return;

        const length = message.content.length;
        const baseMultiplier = 1;
        const incrementPer10 = 0.01;

        const extra = Math.floor(length / 10) * incrementPer10;
        const multiplier = baseMultiplier + extra;

        let xp = 10 * multiplier;

        if (message.channelId === "1430398136668651561") {
            xp += 10 * (1 + message.content.length / 2 * 0.001)
        }

        await addXP(member, profile, xp)

        profile.messages = profile.messages + 1;

        await updateProfile(profile.id, profile)

        const award = async (aID: AchievementID) => {
            const achievement = getAchievement(aID);
            if (achievement)
                await awardAchievementToProfile(member, profile, achievement);
        };

        switch (profile.messages) {
            case 1:
                await award(AchievementID.PrimeiraMensagem)
                break
            case 100:
                await award(AchievementID.Conversante)
                break

            case 1000:
                await award(AchievementID.RedacaoEnem)
                break

            case 10000:
                await award(AchievementID.Dicionario)
                break

            case 100000:
                await award(AchievementID.Biblioteca)
                break

        }



    }
})