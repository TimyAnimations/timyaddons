import Settings from "../utils/settings/main";
import { MoveableDisplay } from "../utils/moveable_display";
import { getArea, getClosedContainer, getContainer, registerArea, registerCloseContainer, registerContainer } from "../utils/skyblock";

const IMPORT_NAME = "TimyAddons/data"
const LOCATION_DATA_FILE = "tab_widgets.json"

const widgets = {};
const enabled_widgets = (() => {
    let location_file = FileLib.exists(IMPORT_NAME, LOCATION_DATA_FILE) 
                                ? FileLib.read(IMPORT_NAME, LOCATION_DATA_FILE)
                                : undefined;
    let saved_data = {};
    if (location_file)
        saved_data = JSON.parse(location_file);

    return saved_data;
})();
FileLib.write(IMPORT_NAME, LOCATION_DATA_FILE, JSON.stringify(enabled_widgets));

var area = undefined;
var current_height = 10;
Settings.registerSetting("Enable Gui Tab Widgets", "tick", () => {
    if (!area) return;
    if (!TabList) return;
    let names = TabList.getNames();
    if (!names) return;

    let key = undefined;
    current_height = 10
    for (let idx = 20; idx < names.length && idx < 80; idx++) {
        for (; !/§r§[0-9a-fk-or]§l.*:.*§r/.test(names[idx]) && idx < names.length && idx < 80; idx++) {
            if (!key || idx % 20 === 0 || names[idx] === "§r") continue;
            widgets[area][key].gui.addLine(names[idx]);
            current_height += 9;
        };

        if (idx === names.length || idx === 80) break;
        
        key = `${area}_${names[idx].split(":")[0]}`.replace(/(§[0-9a-fk-or]|:)/g, "").replace(" ", "_").toLowerCase();
        if (!widgets[area][key]) {
            widgets[area][key] = {gui: new MoveableDisplay(`${key}_widget_display`, 10, current_height), key: key};
            if (!enabled_widgets[key]) enabled_widgets[key] = Settings.widgets_enable_default;
        }

        widgets[area][key].gui.clearLines();
        widgets[area][key].gui.addLine(names[idx]);
        if (enabled_widgets[key])
            widgets[area][key].gui.show();
        else
            widgets[area][key].gui.hide();
        current_height += 18;
    }
}).requireArea("_");

const EMPTY_WIDGET_FUNCTIONS = {
    empty: true,
    Draw: () => {},
    Clicked: (mouse_x, mouse_y, button) => {},
    MouseDragged: (mouse_x, mouse_y, button) => {},
    MouseReleased: (mouse_x, mouse_y, button) => {},
    KeyTyped: (char, key) => {},
    Closed: () => {}
};
var widget_functions = EMPTY_WIDGET_FUNCTIONS;
Settings.registerSetting("Enable Gui Tab Widgets", "guiRender", (x, y, gui) => {
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiContainer"))) 
        return;
    GlStateManager.func_179140_f();
    widget_functions.Draw(); 
});//.requireContainer("_");
Settings.registerSetting("Enable Gui Tab Widgets", "guiMouseClick", (mouse_x, mouse_y, button, gui) => {
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiContainer"))) 
        return;
    widget_functions.Clicked(mouse_x, mouse_y, button); 
});//.requireContainer("_");
Settings.registerSetting("Enable Gui Tab Widgets", "guiMouseDrag",(mouse_x, mouse_y, button, gui) => {
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiContainer"))) 
        return;
    widget_functions.MouseDragged(mouse_x, mouse_y, button); 
});//.requireContainer("_");
Settings.registerSetting("Enable Gui Tab Widgets", "guiMouseRelease", (mouse_x, mouse_y, button, gui) => {
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiContainer"))) 
        return;
    widget_functions.MouseReleased(mouse_x, mouse_y, button); 
});//.requireContainer("_");
Settings.registerSetting("Enable Gui Tab Widgets", "guiKey", (char, key, gui) => {
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiContainer"))) 
        return;
    widget_functions.KeyTyped(char, key); 
});//.requireContainer("_");
Settings.registerSetting("Enable Gui Tab Widgets", "guiClosed", (gui) => {
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiContainer"))) 
        return;

    Client.scheduleTask(1, () => {
        let current_gui = Client.currentGui?.get();
        let current_container = undefined;
        if (current_gui) {
            const current_container_lower_chest_inventory = current_gui.field_147002_h.func_85151_d();
            current_container = current_container_lower_chest_inventory.func_145748_c_().func_150260_c();
        }
        if (!current_container || !current_container.includes("Widget")) {
            widget_functions.Closed();
            widget_functions = EMPTY_WIDGET_FUNCTIONS;
        }
    });
});

registerContainer("_", () => {
    if (!Settings.widgets_enabled) return;
    
    let container = getContainer();
    if (!widget_functions.empty) return;
    if (!container || !container.includes("Widget")) {
        widget_functions = EMPTY_WIDGET_FUNCTIONS;
        return;
    }
    
    widget_functions = initiateWidgitGui();
});

register("worldUnload", () => {
    for (let area of Object.keys(widgets))
    for (let key of Object.keys(widgets[area]))
        widgets[area][key].gui.hide();
});

registerArea("_", () => {
    area = getArea();
    if (!(area in widgets)) {
        widgets[area] = {};
    }
});

function initiateWidgitGui() {
    if (!area || !(area in widgets)) {
        return;
    }

    const current_widgets = Object.values(widgets[area])
    let selected_idx = 0;

    let functions = {
        empty: false,

        Draw: () => {
            for (let i = 0; i < current_widgets.length; i++) {
                if (i === selected_idx) continue;
                current_widgets[i].gui.deselectedDraw(
                    [],
                    1.0, 
                    enabled_widgets[current_widgets[i].key] ? 1.0 : 0.0, 
                    enabled_widgets[current_widgets[i].key] ? 1.0 : 0.0
                );
            }
            current_widgets[selected_idx].gui.selectedDraw(
                [`Press §6[H]&r to ${enabled_widgets[current_widgets[selected_idx].key] ? "§chide" : "§ashow"}`],
                1.0, 
                enabled_widgets[current_widgets[selected_idx].key] ? 1.0 : 0.2, 
                enabled_widgets[current_widgets[selected_idx].key] ? 1.0 : 0.2
            );
        },
    
        Clicked: (mouse_x, mouse_y, button) => {
            for (let i = 0; i < current_widgets.length; i++) {
                if (current_widgets[i].gui.inArea(mouse_x, mouse_y))
                    selected_idx = i;
            }
            current_widgets[selected_idx].gui.mouseClicked(mouse_x, mouse_y, button);
        },
    
        MouseDragged: (mouse_x, mouse_y, button) => {
            current_widgets[selected_idx].gui.mouseDragged(mouse_x, mouse_y, button);
        },
        
        MouseReleased: (mouse_x, mouse_y, button) => {
            for (let i = 0; i < current_widgets.length; i++) {
                current_widgets[i].gui.mouseReleased(mouse_x, mouse_y, button);
            }
        },
    
        KeyTyped: (char, key) => {
            switch (key) {
                case 35:
                    enabled_widgets[current_widgets[selected_idx].key] = !enabled_widgets[current_widgets[selected_idx].key];
                    if (enabled_widgets[current_widgets[selected_idx].key])
                        current_widgets[selected_idx].gui.show();
                    else
                        current_widgets[selected_idx].gui.hide();
    
                    break;
                default:
                    current_widgets[selected_idx].gui.keyTyped(char, key);
            }
        },
        
        Closed: () => {
            for (let i = 0; i < current_widgets.length; i++) {
                current_widgets[i].gui.save();
            }
            FileLib.write(IMPORT_NAME, LOCATION_DATA_FILE, JSON.stringify(enabled_widgets));
        }
    }

    for (let i = 0; i < current_widgets.length; i++) {
        current_widgets[i].gui.setGrabArea();
    }

    return functions;
};

Settings.widgets_open_gui = () => {
    let widget_functions = initiateWidgitGui();
    let gui = new Gui();
    gui.registerDraw( widget_functions.Draw );
    gui.registerClicked( widget_functions.Clicked );
    gui.registerMouseDragged( widget_functions.MouseDragged );
    gui.registerMouseReleased( widget_functions.MouseReleased );
    gui.registerKeyTyped( widget_functions.KeyTyped );
    gui.registerClosed( widget_functions.Closed );
    gui.open();
};

