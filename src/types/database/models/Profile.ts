
export type Profile = {

    id: string;
    bio: string;

    giveawayEntries: number;

    xp: number;
    messages: number;
    voiceTime: number;
    digitGameVictories: number;

    profileBgPath: string;

    profileAchievements: ProfileAchievement[];


};

export type ProfileAchievement = {
    profile_id: string;
    achievement: Achievement;
    obtainedAt: Date;
}

export interface Achievement {
    id: number;
    name: string;
    description: string;
    xp: number;
    bannerURL: string;
}
