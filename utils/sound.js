export function repeatSound(name, volume, pitch, times, delay_ms = 100) {
    World.playSound(name, volume, pitch);
    if (times <= 1) return;
    setTimeout(() => {
        repeatSound(name, volume, pitch, times - 1, delay_ms);
    }, delay_ms)
}