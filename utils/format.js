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

export function playerWithoutRank(player) {
    player = player.split(" ").slice(-1)[0];
    return player;
}