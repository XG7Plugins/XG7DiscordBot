import { ButtonInteraction } from "discord.js";
import {ButtonHandler} from "../../types/Components";

export default class HandleExample implements ButtonHandler {
    id = "SAFOJIASIOFSA";
    run(interaction: ButtonInteraction): void {
        console.log(interaction)
    }

}