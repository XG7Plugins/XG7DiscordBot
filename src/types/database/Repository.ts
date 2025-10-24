export interface Repository<ID, T> {

    table: string

    createTable(): Promise<void>;

    insert(value: T): Promise<void>
    select(id: ID): Promise<T | null>
    update(value: T): Promise<T>
    delete(id: ID): Promise<void>


}