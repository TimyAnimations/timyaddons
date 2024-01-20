import { queueCommand } from "../utils/command_queue";
import { timeElapseString } from "../utils/format";
import Settings from "../utils/settings/main";

var lobby_history = {};
var current_server = undefined;

Settings.registerSetting("Time Since Last In Lobby", "chat", (server, event) => {
    // if (this.verbos)
    //     ChatLib.chat(`current server changing from ${this.current_server} to ${server}`);
    
    if (current_server)
        lobby_history[current_server] = Date.now();

    if (server in lobby_history)
        ChatLib.chat(`&7Last in this server &6${timeElapseString(lobby_history[current_server] - lobby_history[server])}&7 ago`);
    
    current_server = server;
}).setCriteria("&7Sending to server ${server}...&r").setStart();

function announceFailedWarp(event) {
    var message = new Message( EventLib.getMessage(event) ).getUnformattedText().replace(/§[0-9a-fk-or]/g, "");
    message = message.split("").map((c) => Math.floor(Math.random() * 2) ? c.toLowerCase() : c.toUpperCase()).join("");
    queueCommand(`pc ${message}`);
}

var fail_warp_triggers = [
    register("chat", announceFailedWarp).setCriteria("&cYou were kicked while joining that server!&r"),
    register("chat", announceFailedWarp).setCriteria("&cOops! You are not on SkyBlock so we couldn't warp you!&r"),
    register("chat", announceFailedWarp).setCriteria("&cException Connecting:").setStart(),
]
fail_warp_triggers.forEach(trigger => trigger.unregister());

Settings.registerSetting("Announce Failed Warps to Party", "worldUnload", () => {
    fail_warp_triggers.forEach(trigger => trigger.unregister());
});

Settings.registerSetting("Announce Failed Warps to Party", "chat", () => {
    fail_warp_triggers.forEach(trigger => trigger.register());
}).setCriteria("&9&m-----------------------------\n&r${*}&r&f &r&eentered &r${*}&r&e, &r${*}&r&e!\n&r&9&m-----------------------------&r");

Settings.registerSetting("Announce Failed Warps to Party", "chat", () => {
    fail_warp_triggers.forEach(trigger => trigger.register());
}).setCriteria("&eParty Leader, &r${*}&r&e, summoned you to their server.&r");

// §eParty Leader, §r§b[MVP§r§9+§r§b] JexD§r§e, summoned you to their server.§r