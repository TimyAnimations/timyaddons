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
export function timeElapseStringShort(milliseconds, precision = 0) {
    let string = "";
    if (milliseconds < 0) {
        milliseconds = -milliseconds;
        string = "-"
    }
    let days = Math.floor(milliseconds/8.64e+7);
    let hours = Math.floor((milliseconds % 8.64e+7)/3.6e+6);
    let minutes = Math.floor((milliseconds % 3.6e+6)/60000);
    let seconds = ((milliseconds % 60000)/1000);
    seconds = precision === 0 ? Math.floor(seconds) : seconds.toFixed(precision);
    
    string += days > 0 ? `${days}d ` : '';
    string += days > 0 || hours > 0 ? `${hours}h ` : '';
    string += days > 0 || hours > 0 || minutes > 0 ? `${minutes}m ` : '';
    string +=`${seconds}s`;
    
    return string;
}
export function parseTimeString(string) {
    let milliseconds = 0;
    string.match(/\d+[dhms]/g).forEach((part) => {
        const char = part.charAt(part.length - 1);
        const num = parseInt(part.replace(/[dhms]/g, ""));
        if (isNaN(num)) return;

        switch (char) {
            case "d": milliseconds += num *  8.64e+7; break;
            case "h": milliseconds += num *  3.6e+6; break;
            case "m": milliseconds += num *  60000; break;
            case "s": milliseconds += num *  1000; break;
        }
    });
    return milliseconds;
}

export function timeElapseStringShortSingleUnit(milliseconds, precision = 0) {
    let string = "";
    if (milliseconds < 0) {
        milliseconds = -milliseconds;
        string = "-"
    }
    let days = milliseconds/8.64e+7;
    let hours = (milliseconds % 8.64e+7)/3.6e+6;
    let minutes = (milliseconds % 3.6e+6)/60000;
    let seconds = (milliseconds % 60000)/1000;
    
    if (Math.floor(days) > 0) return string + `${precision > 0 ? days.toFixed(precision) : Math.floor(days)}d`;
    if (Math.floor(hours) > 0) return string + `${precision > 0 ? hours.toFixed(precision) : Math.floor(hours)}h`;
    if (Math.floor(minutes) > 0) return string + `${precision > 0 ? minutes.toFixed(precision) : Math.floor(minutes)}m`;

    return string + `${precision > 0 ? seconds.toFixed(precision) : Math.floor(seconds)}s`;
}

export function timeElapseStringShortSingleUnitHours(milliseconds) {
    let string = "";
    if (milliseconds < 0) {
        milliseconds = -milliseconds;
        string = "-"
    }
    let hours = Math.floor((milliseconds)/3.6e+6);
    let minutes = Math.floor((milliseconds % 3.6e+6)/60000);
    let seconds = Math.floor((milliseconds % 60000)/1000);
    
    if (hours > 0) return string + `${hours}h`;
    if (minutes > 0) return string + `${minutes}m`;

    return string + `${seconds}s`;
}

export function toCommas(value, fixed = 0) {
    return value.toFixed(fixed).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function toCompactCommas(value, fixed = 2) {
    if (value >= 1_000_000_000)
        return `${toCommas(value / 1_000_000_000, fixed)}B`;
    if (value >= 1_000_000)
        return `${toCommas(value / 1_000_000, fixed)}M`;
    if (value >= 10_000)
        return `${toCommas(value / 1_000, fixed)}K`;
    return toCommas(value, fixed);
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