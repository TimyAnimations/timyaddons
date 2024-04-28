export function timeElapseString(milliseconds) {
    let string = "";
    if (milliseconds < 0) {
        milliseconds = -milliseconds;
        string = "-"
    }
    let hours = Math.floor(milliseconds/3.6e+6);
    let minutes = Math.floor((milliseconds % 3.6e+6)/60000);
    let seconds = Math.floor((milliseconds % 60000)/1000);
    
    string += hours > 0 ? `${hours} hour${hours == 1 ? '' : 's'} ` : '';
    string += hours > 0 || minutes > 0 ? `${minutes} minute${minutes == 1 ? '' : 's'} ` : '';
    string +=`${seconds} second${seconds == 1 ? '' : 's'}`;
    
    return string;
}
export function timeElapseStringShort(milliseconds) {
    let string = "";
    if (milliseconds < 0) {
        milliseconds = -milliseconds;
        string = "-"
    }
    let hours = Math.floor(milliseconds/3.6e+6);
    let minutes = Math.floor((milliseconds % 3.6e+6)/60000);
    let seconds = Math.floor((milliseconds % 60000)/1000);
    
    string += hours > 0 ? `${hours}h ` : '';
    string += hours > 0 || minutes > 0 ? `${minutes}m ` : '';
    string +=`${seconds}s`;
    
    return string;
}

export function timeElapseStringShortSingleUnit(milliseconds) {
    let string = "";
    if (milliseconds < 0) {
        milliseconds = -milliseconds;
        string = "-"
    }
    let hours = Math.floor(milliseconds/3.6e+6);
    let minutes = Math.floor((milliseconds % 3.6e+6)/60000);
    let seconds = Math.floor((milliseconds % 60000)/1000);
    
    if (hours > 0) return string + `${hours}h`;
    if (minutes > 0) return string + `${minutes}m`;

    return string + `${seconds}s`;
}

export function toCommas(value, fixed = 0) {
    return value.toFixed(fixed).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function playerWithoutRank(player) {
    player = player.split(" ").slice(-1)[0];
    return player;
}

export function stringWidth(text) {
    text = text.replace("\n", "").replace(/&(?=[0-9a-flr])/g, "§");
    let bolded_char_count = 0;
    text.match(/§l.*?(§|$)/g)?.forEach((match) => {
        bolded_char_count += match.replace(/§[0-9a-fk-or]/g, "").length;
    })
    return Renderer.getStringWidth(text) + (bolded_char_count > 0 ? Math.floor(bolded_char_count * 0.5) : 0);
}

export function getEndTextColor(text) {
    text = text.replace("\n", "").replace(/&(?=[0-9a-fr])/g, "§");
    let matches = text.match(/§[0-9a-fr]/g);
    if (matches) switch (matches[matches.length - 1]) {
        case "§0": return Renderer.BLACK;
        case "§1": return Renderer.DARK_BLUE;
        case "§2": return Renderer.DARK_GREEN;
        case "§3": return Renderer.DARK_AQUA;
        case "§4": return Renderer.DARK_RED;
        case "§5": return Renderer.DARK_PURPLE;
        case "§6": return Renderer.GOLD;
        case "§7": return Renderer.GRAY;
        case "§8": return Renderer.DARK_GRAY;
        case "§9": return Renderer.BLUE;
        case "§a": return Renderer.GREEN;
        case "§b": return Renderer.AQUA;
        case "§c": return Renderer.RED;
        case "§d": return Renderer.LIGHT_PURPLE;
        case "§e": return Renderer.YELLOW;
    }
    return Renderer.WHITE;
}

export function longestStringWidth(lines) {
    let longest_width = 0;
    lines.forEach((line) => {
        let width = stringWidth(line);
        if (longest_width < width) longest_width = width;
    });
    return longest_width;
}