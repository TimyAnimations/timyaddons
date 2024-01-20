const IMPORT_NAME = "TimyAddons/data"
const LOCATION_DATA_FILE = "keybinds.json"

var key_bind_codes = loadKeyBinds();
var key_binds = {};

function loadKeyBinds() {
    let location_file = FileLib.exists(IMPORT_NAME, LOCATION_DATA_FILE) 
                                ? FileLib.read(IMPORT_NAME, LOCATION_DATA_FILE)
                                : undefined;
    if (!location_file)
        return {};

    return JSON.parse(location_file);
}

function saveKeyBinds() {
    for (let key in Object.keys(key_binds))
        key_bind_codes[key] = key_binds[key].getKeyCode();

    FileLib.write(IMPORT_NAME, LOCATION_DATA_FILE, JSON.stringify(key_bind_codes));
}

register("gameUnload", () => { saveKeyBinds(); });

export function createKeyBind(description, default_key_code, category) {
    let key = `${category}.${description}`;
    const key_bind = new KeyBind(description, key_bind_codes[key] ?? default_key_code, category);
    key_binds[key] = key_bind;
    return key_bind;
}