import {Repository} from "../types/database/Repository";
import {WarningModel} from "../types/database/models/WarningModel";
import {database} from "../index";
import * as console from "node:console";

export default class WarningsRepository implements Repository<number, WarningModel>{
    table = "warnings";

    createTable(): Promise<void> {
        return database.query(
            `CREATE TABLE IF NOT EXISTS ${this.table} (
            id INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
            user_id VARCHAR(255) NOT NULL,
            reason MEDIUMTEXT NOT NULL,
            PRIMARY KEY(id)
            )`,
            []
        ).then(result => {
            console.log("Tabela warning criada com sucesso!".green);
        });
    }
    insert(value: WarningModel): Promise<void> {
        return database.query(
                `INSERT INTO ${this.table} (user_id, reason) VALUES (?, ?, ?)`,
                [value.user_id, value.reason]
        )
    }
    select(id: number): Promise<WarningModel> {
        return database.query(
            `SELECT * FROM ${this.table} WHERE id = ?`,
            [id]

        )
    }
    update(value: WarningModel): Promise<WarningModel> {
        return database.query(
            `UPDATE ${this.table} (id, reason) 
            SET reason = ? WHERE id = ?`,
            [value.reason, value.id]
        )
    }
    delete(id: number): Promise<void> {
        return database.query(
            `DELETE FROM ${this.table} WHERE id = ?`,
                [id]
            )
    }

    async selectAllFrom(user_id: string): Promise<WarningModel[]> {
        const [rows] = await database.query(
            `SELECT * FROM ${this.table} WHERE user_id = ?`,
            [user_id]
        );
        return rows as WarningModel[];
    }

}