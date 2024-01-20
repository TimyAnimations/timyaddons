import { queueCommand } from "../../utils/command_queue";
import { playerWithoutRank } from "../../utils/format";
import Settings from "../../utils/settings/main"

var last_boss = undefined;

const downtime_triggers = [
    Settings.registerSetting("Autorequeue Instance &8- &7&o/downtime, /dt&r", "chat", (instance) => {
        let downtime = Settings.dungeon_downtime_seconds;
        last_boss = undefined;
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
    }).setCriteria("      &r&6&lCLICK HERE &bto re-queue into ${instance}&r").setStart(),
    Settings.registerSetting("Autorequeue Instance &8- &7&o/downtime, /dt&r", "chat", (boss, time) => {
        if (!Settings.dungeon_downtime_fail_instant_requeue) return;
        last_boss = boss;
    }).setCriteria("&r&r&r                &r&c☠ &r&eDefeated &r${boss}&r&ein &r${time}&r")
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

Settings.addAction("Autorequeue Instance &8- &7&o/downtime, /dt&r", () => { last_boss = undefined; });

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

/*
§r§a§l????????????????????????????????????????????????????????????????§r
[13:27:28] [Client thread/INFO]: [CHAT] §r§r§r                   §r§cMaster Mode Catacombs §r§8- §r§eFloor III§r
[13:27:28] [Client thread/INFO]: [CHAT] §r
[13:27:28] [Client thread/INFO]: [CHAT] §r§r§r                             §r§fTeam Score: §r§a0 §r§f(§r§cD§r§f)§r
[13:27:28] [Client thread/INFO]: [CHAT] §r§r                             §6> §e§lEXTRA STATS §6<§r
[13:27:28] [Client thread/INFO]: [CHAT] §r§a§l????????????????????????????????????????????????????????????????§r
 ☠ glyphics_100 was killed by Thunder.
§r§a§l????????????????????????????????????????????????????????????????§r
[13:37:52] [Client thread/INFO]: [CHAT] §r§r§r                   §r§cMaster Mode Catacombs §r§8- §r§eFloor III§r
[13:37:52] [Client thread/INFO]: [CHAT] §r
[13:37:52] [Client thread/INFO]: [CHAT] §r§r§r                            §r§fTeam Score: §r§a292 §r§f(§r§bS§r§f)§r
[13:37:52] [Client thread/INFO]: [CHAT] §r§r§r                §r§c? §r§eDefeated §r§cThe Professor §r§ein §r§a09m 36s§r
[13:37:52] [Client thread/INFO]: [CHAT] §r§r                             §6> §e§lEXTRA STATS §6<§r
[13:37:52] [Client thread/INFO]: [CHAT] §r§r§r                     §r§8+§r§356,721 Catacombs Experience§r
[13:37:52] [Client thread/INFO]: [CHAT] §r§r§r                        §r§8+§r§340,198.7 Mage Experience§r
[13:37:52] [Client thread/INFO]: [CHAT] §r§a§l????????????????????????????????????????????????????????????????§r
*/

