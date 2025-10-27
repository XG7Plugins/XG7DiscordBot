import mysql, {Pool} from 'mysql2/promise';
import 'dotenv/config';
import {Repository} from "./database/Repository";
import {Collection} from "discord.js";
import fileS from "fs";
import path from "path";
import * as console from "node:console";

export class DatabasePool {
    pool: Pool | undefined;

    public repositories: Collection<string, Repository<any, any>> = new Collection();


    init() {
        // @ts-ignore
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });

        this.registerRepositories().then(() => {
            this.repositories.forEach(async (repository) => {
                await repository.createTable();
            })
        })

    }

    async registerRepositories() {
        const dir = path.join(__dirname, "..", "repositories");
        const files = fileS.readdirSync(dir).filter(file => file.endsWith(".js") || file.endsWith(".ts"));

        for (const file of files) {
            const RepoClass = (await import(path.join(dir, file))).default;
            const repository = new RepoClass();

            if (!repository?.table) {
                console.warn(`Repositório em ${file} não possui propriedade "table"!`);
                continue;
            }

            this.repositories.set(repository.table, repository);
        }

        console.log(`Foram registrados ${this.repositories.size} repositórios`.blue);
    }


    async query(sql: string, args: Array<any>): Promise<any> {
        return await this.pool?.query(sql, args);
    }

    shutdown(): Promise<void> {
        // @ts-ignore
        return this.pool?.end();
    }


}