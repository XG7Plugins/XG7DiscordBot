import { Repository } from "../types/database/Repository";
import {Achievement, Profile, ProfileAchievement} from "../types/database/models/Profile";
import { database } from "../index";
import {getAchievementByNumber} from "../types/database/models/Achievements";
import {AttachmentBuilder, GuildMember} from "discord.js";
import {addXP} from "./profile";
import {generateAchievementImage} from "../commands/profile/achievement";

export default class ProfileAchievementsRepository implements Repository<number, ProfileAchievement> {
    table = "profile_achievements";

    async createTable(): Promise<void> {
        return database.query(`
            CREATE TABLE IF NOT EXISTS ${this.table} (
                                                         id INT AUTO_INCREMENT PRIMARY KEY,
                                                         profile_id VARCHAR(20) NOT NULL,
                achievement_id VARCHAR(50) NOT NULL,
                obtained_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES profiles(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
                )
        `, []);
    }


    insert(value: ProfileAchievement): Promise<void> {
        return database.query(
            `INSERT INTO ${this.table} (profile_id, achievement_id, obtained_at) VALUES (?, ?, ?)`,
            [value.profile_id, value.achievement.id, value.obtainedAt || new Date()]
        );
    }

    async select(id: number): Promise<ProfileAchievement | null> {
        const results = await database.query(
            `SELECT * FROM ${this.table} WHERE id = ?`,
            [id]
        );
        const row = results[0]?.[0];
        return row ? {
            profile_id: row.profile_id,
            achievement: getAchievementByNumber(row.achievement_id as number),
            obtainedAt: new Date(row.obtained_at)
        } : null;
    }

    async update(value: ProfileAchievement): Promise<ProfileAchievement> {
        throw new Error("Method not implemented.");
    }

    delete(id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async selectByProfile(profileId: string): Promise<ProfileAchievement[]> {
        const results = await database.query(
            `SELECT * FROM ${this.table} WHERE profile_id = ?`,
            [profileId]
        );
        return results[0].map((row: any) => ({
            id: row.id,
            achievement: getAchievementByNumber(row.achievement_id as number),
            obtainedAt: new Date(row.obtained_at)
        }));
    }
}

export async function awardAchievementToProfile(
    member: GuildMember,
    profile: Profile,
    achievement: Achievement
): Promise<void> {

    const repo = database.repositories.get("profile_achievements") as ProfileAchievementsRepository;
    if (!repo) return;

    const existing = await repo.selectByProfile(profile.id);
    const hasAchievement = existing.some(a => a.achievement.id === achievement.id);
    if (hasAchievement) return;

    await repo.insert({
        profile_id: profile.id,
        achievement: achievement,
        obtainedAt: new Date()
    });

    await addXP(member, profile, achievement.xp);

    profile.profileAchievements.push({
        profile_id: profile.id,
        achievement: achievement,
        obtainedAt: new Date()
    })

    await generateAchievementImage(member, achievement, profile);

    const attachment = new AttachmentBuilder(`./src/assets/generated/achievement.png`);

    member.send({
            content: `Você conseguiu a conquista **${achievement.name}**!\nGanhando ${achievement.xp}XP.`,
            files: [attachment],
        }).catch(() => {});
}
