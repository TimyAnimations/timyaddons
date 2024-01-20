// import Utils from "./utils/utils";
var chat_queue = [];
var chat_command_args = {};
var chat_cooldown = 0;
var chat_last_command = "";
var chat_last_args = [];
var chat_recent_send_counts = 0;

export function queueCommand(command, ...args) {
    // if (Utils.verbos) ChatLib.chat("queueing: " + command + args);
    if (args && args.length > 0) {
        if (command in chat_command_args) {
            chat_command_args[command] = chat_command_args[command].map((arg, i) => arg + (args[i] ?? 0));
        }
        else
            chat_command_args[command] = args;

        // if (Utils.verbos) ChatLib.chat("args of \"" + command + "\": "+ chat_command_args[command]);
        
    }
    if (chat_queue.includes(command)) 
        return;
    chat_queue.push(command);
    queue_trigger.register();
}

queue_trigger = register("tick", () => {
    if (chat_cooldown > 0) {
        chat_cooldown--;
        return;
    }

    if (chat_queue.length <= 0) {
        if (chat_recent_send_counts > 0) 
            chat_recent_send_counts--;
        else
            queue_trigger.unregister();
        return;
    }

    let command = chat_queue.shift();
    chat_last_command = command;
    
    if (command in chat_command_args) {
        command = [command, ...chat_command_args[command].map((n) => n.toString())].join(" ");
        
        chat_last_args = chat_command_args[chat_last_command];
        chat_command_args[chat_last_command] = []; delete chat_command_args[chat_last_command];
    }
    else
        chat_last_args = [];


    // if (Utils.verbos) ChatLib.chat("sending: " + command);
    ChatLib.command(command, false);
    
    command_failed_trigger.register();
    setTimeout(() => {
        chat_last_command = "";
        chat_last_args = [];
        command_failed_trigger.unregister();
    }, 1_000);

    chat_cooldown = 10 + Math.max(chat_recent_send_counts * 2, 20);
    chat_recent_send_counts++;
});

queue_trigger.unregister();

command_failed_trigger = register("chat", (event) => {
    // if (Utils.verbos) ChatLib.chat("requeuing: " + chat_last_command);
    chat_cooldown = 40;
    chat_command_args[chat_last_command] = chat_last_args;
    chat_queue.unshift(chat_last_command);
}).setCriteria("&r&cCommand Failed:").setStart();

command_failed_trigger.unregister();
