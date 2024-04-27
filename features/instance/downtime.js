import { queueCommand } from "../../utils/command_queue";
import { playerWithoutRank } from "../../utils/format";
import Settings from "../../utils/settings/main"

const downtime_triggers = [
    Settings.registerSetting("Autorequeue Instance &8- &7&o/downtime, /dt&r", "chat", (instance) => {
        let downtime = Settings.dungeon_downtime_seconds;
        if (instance === "§a§cKuudra's Hollow!") {
            // ChatLib.chat("&eRequeueing when all members say &6\"r\" &ein party chat");
            // ready_players.register();
            return;
        }
        if (downtime > 0) ChatLib.chat(`      &eRequeueing in &6${downtime} &eseconds`)
        if (Settings.dungeon_downtime_party_announcement && downtime >= 5)
            queueCommand(`pc Requeueing in ${downtime} seconds`);
        setTimeout( () => { 
            if (!Settings.dungeon_downtime_enabled) return;
            queueCommand("instancerequeue");
        }, downtime * 1000 );
    }).setCriteria("      &r&6&lCLICK HERE &bto re-queue into ${instance}&r").setStart()
];

const PLAYER_COUNT = 4;
var ready_players = new Set();
const ready_trigger = register("chat", (player) => {
    ChatLib.chat(`${player}`);
    player = playerWithoutRank(player);
    ready_players.add(player);
    ChatLib.chat(`${player} &ris ready ${ready_players.size}/${PLAYER_COUNT}`);
    if (ready_players.size < PLAYER_COUNT) return;
    ready_trigger.unregister();
    
    let downtime = Settings.dungeon_downtime_seconds;
    
    if (downtime > 0) ChatLib.chat(`&eRequeueing in &6${downtime} &eseconds`)
    if (Settings.dungeon_downtime_party_announcement && downtime >= 5)
        queueCommand(`pc Requeueing in ${downtime} seconds`);
    setTimeout( () => { 
        if (!Settings.dungeon_downtime_enabled) return;
        queueCommand("instancerequeue");
    }, downtime * 1000 );
}).setCriteria("&r&9Party &8> ${player}&f: &rr").setStart();
ready_trigger.unregister();
register("worldLoad", () => { 
    ready_players.clear();
    ready_trigger.unregister();
});

Settings.registerSetting("Announce When Ready to Party", "guiMouseClick", (x, y, button, gui) => {
    const clicked_item_vanilla = gui?.slotUnderMouse?.func_75211_c();
    if (!clicked_item_vanilla) return;

    const clicked_item = new Item(clicked_item_vanilla)
    if (clicked_item.getName() === "§aOpen Reward Chest")
        queueCommand("pc r");
}).requireArea("Kuudra");

Settings.dungeon_downtime_enabled = false;
downtime_triggers.forEach(trigger => trigger.update());

register("command", (arg1) => {
    let downtime = Number(arg1);
    
    if (downtime < 0 || downtime > 90) downtime = NaN;
    
    if (Number.isNaN(downtime)) {
        if (Settings.dungeon_downtime_enabled) {
            ChatLib.chat("&cAutorequeue is now disabled");
            Settings.dungeon_downtime_enabled = false;
            downtime_triggers.forEach(trigger => trigger.update());
        }
        else {
            ChatLib.chat(`&aAutorequeue is now enabled, currently set to &6${Settings.dungeon_downtime_seconds} seconds`);
            Settings.dungeon_downtime_enabled = true;
            downtime_triggers.forEach(trigger => trigger.update());
        }
        return;
    }
    
    Settings.dungeon_downtime_enabled = true;
    downtime_triggers.forEach(trigger => trigger.update());
    
    Settings.dungeon_downtime_seconds = downtime;
    ChatLib.chat(`&aAutorequeue is now enabled, set to &6${downtime} seconds`);
}).setName("downtime").setAliases("dt");