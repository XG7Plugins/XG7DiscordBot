import {ClientEvents} from "discord.js";

export type EventType<Key extends keyof ClientEvents> = {
    type: Key,
    once?: boolean | false,
    handle(...event: ClientEvents[Key]): any;
};

export class Listener<Key extends keyof ClientEvents> {

    options: EventType<Key>;

    constructor(options: EventType<Key>) {
        this.options = options;
        Object.assign(this, options);
    }
}