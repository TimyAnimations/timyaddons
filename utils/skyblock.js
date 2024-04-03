// Area
var area = undefined;
var area_triggers = {};
var all_registers = [];

export function getArea() {
    if (area) return area;
    return updateArea();
}

export function setArea(new_area) {
    area = new_area;

    if (area in area_triggers)
        area_triggers[area].forEach(method => { method(); });

    if ("_" in area_triggers)
        area_triggers["_"].forEach(method => { method(); });

    return area;
}

var retry_attempts = 0;
const MAX_ATTEMPTS = 10;
function updateArea() {
    if (!TabList) return;
    let tab_list = TabList?.getNames();
    if (tab_list.length < 42) {
        if (retry_attempts < MAX_ATTEMPTS) {
            retry_attempts++;
            setTimeout(updateArea, 1000);
        }
        return undefined;
    }
    let tab = tab_list[41];
    
    // third column check
    if (!tab?.startsWith("§r§b§lArea: §r") && !tab?.startsWith("§r§b§lDungeon: §r"))
        tab = tab_list[21];

    if (!tab?.startsWith("§r§b§lArea: §r") && !tab?.startsWith("§r§b§lDungeon: §r")) {
        if (retry_attempts < MAX_ATTEMPTS) {
            retry_attempts++;
            setTimeout(updateArea, 1000);
        }
        return undefined;
    }
    
    if (tab?.startsWith("§r§b§lDungeon: §r"))
        area = "Dungeon";
    else
        area = tab.slice("§r§b§lArea: §r".length, -2).replace(/(§[0-9a-fk-or])/g, "");

    if (area in area_triggers)
        area_triggers[area].forEach(method => { method(); });

    if ("_" in area_triggers)
        area_triggers["_"].forEach(method => { method(); });

    return area;
}

register("worldUnload", () => {
    all_registers.forEach(trigger => trigger.unregister());
    area = undefined;
});

register("worldLoad", () => {
    retry_attempts = 0;
    updateArea();
});

export function registerArea(area, method) {
    if (!(area in area_triggers))
        area_triggers[area] = [];
    area_triggers[area].push(method);
}

export function requireArea(area, trigger) {
    registerArea(area, () => trigger.register());

    if (area !== getArea())
        trigger.unregister();

    if (!(trigger in all_registers))
        all_registers.push(trigger);

    return trigger;
}

export function testFunction(string) {
    ChatLib.chat(string);
}

// Container
var container = undefined;
var container_triggers = {};
var closed_container = undefined;
var container_close_trigger = {};

export function getContainer() {
    return container;
}
export function getClosedContainer() {
    return closed_container;
}

register("guiOpened", (event) => {
    if (!event.gui || !(event.gui.field_147002_h instanceof Java.type("net.minecraft.inventory.ContainerChest"))) 
        return;

    const container_lower_chest_inventory = event.gui.field_147002_h.func_85151_d();
    container = container_lower_chest_inventory.func_145748_c_().func_150260_c();
    Client.scheduleTask(1, () => {
        if (container !== Player.getContainer().getName()) {
            container = undefined;
            return;
        }
        
        if (container in container_triggers)
            container_triggers[container].forEach(method => { method(); });
        
        if ("_" in container_triggers)
            container_triggers["_"].forEach(method => { method(); });
    })
});

register("guiClosed", (gui) => {
    if (!gui || !(gui.field_147002_h instanceof Java.type("net.minecraft.inventory.ContainerChest")))
        return;

    const container_lower_chest_inventory = gui.field_147002_h.func_85151_d();
    closed_container = container_lower_chest_inventory.func_145748_c_().func_150260_c();

    if (closed_container in container_close_trigger)
        container_close_trigger[closed_container].forEach(method => { method(); });
    
    if ("_" in container_close_trigger)
        container_close_trigger["_"].forEach(method => { method(); });
        
    if (closed_container === container)
        container = undefined;
});

export function registerContainer(container, method) {
    if (!(container in container_triggers))
        container_triggers[container] = [];
    container_triggers[container].push(method);
}
export function registerCloseContainer(container, method) {
    if (!(container in container_close_trigger))
        container_close_trigger[container] = [];
    container_close_trigger[container].push(method);
}

export function requireContainer(container, trigger) {
    trigger.unregister();
    registerContainer(container, () => trigger.register());
    registerCloseContainer(container, () => trigger.unregister());
    return trigger;
}

export function isHoldingSkyblockItem(...ids) {
    const item_id = getHeldSkyblockItemID()
    return item_id !== undefined && ids.includes(item_id);
}

export function getHeldSkyblockItemID() {
    const item = Player?.getHeldItem();
    if (!item) return undefined;
    
    const item_data = item.getNBT()?.toObject();
    const item_id = item_data?.tag?.ExtraAttributes?.id;
    return item_id;
}