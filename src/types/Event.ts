import {ClientEvents} from "discord.js";

export type EventType<Key extends keyof ClientEvents> = {
    type: Key,
    once?: boolean,
    handle(...args: ClientEvents[Key]): any;
};

export class Listener<Key extends keyof ClientEvents> {

    options: EventType<Key>;

    constructor(options: EventType<Key>) {
        this.options = options;
        Object.assign(this, options);
    }
}