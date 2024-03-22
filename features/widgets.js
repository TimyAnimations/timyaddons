import Settings from "../utils/settings/main";
import { MoveableDisplay } from "../utils/moveable_display";
import { getArea, getClosedContainer, getContainer, registerArea, registerCloseContainer, registerContainer } from "../utils/skyblock";
import { Button, Checkbox, GuiMenu } from "../utils/menu_gui";

const IMPORT_NAME = "TimyAddons/data"
const LOCATION_DATA_FILE = "tab_widgets.json"

const widgets = {};
const enabled_widgets = (() => {
    let location_file = FileLib.exists(IMPORT_NAME, LOCATION_DATA_FILE) 
                                ? FileLib.read(IMPORT_NAME, LOCATION_DATA_FILE)
                                : undefined;
    let saved_data = {"GLOBAL_DEFAULTS":{}};
    if (location_file)
        saved_data = JSON.parse(location_file);

    if (!saved_data["GLOBAL_DEFAULTS"])
        saved_data["GLOBAL_DEFAULTS"] = {};

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
    let title = undefined;
    current_height = 10
    for (let idx = 20; idx < names.length && idx < 80; idx++) {
        for (; !/^\S*§r§[0-9a-fk-or]§l.*:.*§r/.test(names[idx]) && idx < names.length && idx < 80; idx++) {
            if (!key || idx % 20 === 0 || names[idx] === "§r") continue;
            widgets[area][key].gui.addLine(names[idx]);
            current_height += 9;
        };

        if (idx === names.length || idx === 80) break;
        
        title = names[idx].split(":")[0];
        global_key = `GLOBAL_${title}`.replace(/(§[0-9a-fk-or]|:|')/g, "").replace(/\s/g, "_").toLowerCase();
        key = `${area}_${title}`.replace(/(§[0-9a-fk-or]|:|')/g, "").replace(/\s/g, "_").toLowerCase();
        if (!widgets[area][key]) {
            if (enabled_widgets["GLOBAL_DEFAULTS"][global_key]) {
            
            }
            widgets[area][key] = {
                gui: enabled_widgets["GLOBAL_DEFAULTS"][global_key] 
                        ? new MoveableDisplay(`${key}_widget_display`, enabled_widgets["GLOBAL_DEFAULTS"][global_key].x, enabled_widgets["GLOBAL_DEFAULTS"][global_key].y,
                                                                       enabled_widgets["GLOBAL_DEFAULTS"][global_key].scale_x, enabled_widgets["GLOBAL_DEFAULTS"][global_key].scale_y) 
                        : new MoveableDisplay(`${key}_widget_display`, 10, current_height), 
                key: key, global_key: global_key, title: title
            };
            if (!enabled_widgets[key]) enabled_widgets[key] = enabled_widgets[global_key] ?? Settings.widgets_enable_default;
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
    draw: (mouse_x, mouse_y) => {},
    clicked: (mouse_x, mouse_y, button) => {},
    mouseDragged: (mouse_x, mouse_y, button) => {},
    mouseReleased: (mouse_x, mouse_y, button) => {},
    keyTyped: (char, key) => {},
    closed: () => {}
};
var widget_functions = EMPTY_WIDGET_FUNCTIONS;
Settings.registerSetting("Enable Gui Tab Widgets", "guiRender", (mouse_x, mouse_y, gui) => {
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiContainer"))) 
        return;
    GlStateManager.func_179140_f();
    widget_functions.draw(mouse_x, mouse_y); 
});//.requireContainer("_");
Settings.registerSetting("Enable Gui Tab Widgets", "guiMouseClick", (mouse_x, mouse_y, button, gui) => {
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiContainer"))) 
        return;
    widget_functions.clicked(mouse_x, mouse_y, button); 
});//.requireContainer("_");
Settings.registerSetting("Enable Gui Tab Widgets", "guiMouseDrag",(mouse_x, mouse_y, button, gui) => {
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiContainer"))) 
        return;
    widget_functions.mouseDragged(mouse_x, mouse_y, button); 
});//.requireContainer("_");
Settings.registerSetting("Enable Gui Tab Widgets", "guiMouseRelease", (mouse_x, mouse_y, button, gui) => {
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiContainer"))) 
        return;
    widget_functions.mouseReleased(mouse_x, mouse_y, button); 
});//.requireContainer("_");
Settings.registerSetting("Enable Gui Tab Widgets", "guiKey", (char, key, gui) => {
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiContainer"))) 
        return;
    widget_functions.keyTyped(char, key); 
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
            widget_functions.closed();
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
    for (let area of Object.keys(widgets)) {
        if (area === "GLOBAL") continue;
        for (let key of Object.keys(widgets[area]))
            widgets[area][key].gui.hide();
    }
});

registerArea("_", () => {
    area = getArea();
    if (!(area in widgets)) {
        widgets[area] = {};
    }
});

var show_hidden = false;
var aligning = true;
var tab_preview = false;
function initiateWidgitGui() {
    if (!area || !(area in widgets)) {
        return;
    }

    const current_widgets = Object.values(widgets[area])
    let selected_idx = -1;
    
    let selector = new GuiMenu(110, -110, [
        "§6§lGUI Tab Widget:§r\n",
        ...current_widgets.map((widget, idx) => {
            return new Checkbox(
                `  ${widget.title}\n`, 
                () => {
                    enabled_widgets[widget.key] = !enabled_widgets[widget.key];
                    if (enabled_widgets[widget.key]) {
                        widget.gui.show();
                        selected_idx = idx;
                    }
                    else {
                        widget.gui.hide();
                        if (selected_idx == idx)
                            selected_idx = -1;
                    }
                },
                () => { return enabled_widgets[widget.key] }
            )
        }),
        "\n",
        "§6§lSettings:§r\n",
        new Checkbox("  Show Hidden\n", () => { show_hidden = !show_hidden }, () => show_hidden ),
        new Checkbox("  Snap to Align\n", () => { aligning = !aligning }, () => aligning ),
        new Checkbox("  Tab Preview\n", () => { tab_preview = !tab_preview }, () => tab_preview ),
        "\n",
        new Button(
            "     §0Reset     ", 
            () => {
                for (let i = 0; i < current_widgets.length; i++) {
                    current_widgets[i].gui.reset();
                }
            },
            Renderer.color(255, 85, 85)
        ),
        new Button(
            "    §0Refresh   ",
            () => {widget_functions = initiateWidgitGui();},
            Renderer.color(85, 255, 85))
    ]);
    selector.setAnchor(0.5, 0.5);

    let point_aligns = [];
    let x_axis_aligns = [];
    let y_axis_aligns = [];

    function toggleVisibilitySelected() {
        enabled_widgets[current_widgets[selected_idx].key] = !enabled_widgets[current_widgets[selected_idx].key];
        if (enabled_widgets[current_widgets[selected_idx].key])
            current_widgets[selected_idx].gui.show();
        else
            current_widgets[selected_idx].gui.hide();
    }
    function applySelectedGlobally() {
        const global_key = current_widgets[selected_idx].global_key;
        enabled_widgets["GLOBAL_DEFAULTS"][global_key] = {
            x: current_widgets[selected_idx].gui.x,
            y: current_widgets[selected_idx].gui.y,
            scale_x: current_widgets[selected_idx].gui.scale_x,
            scale_y: current_widgets[selected_idx].gui.scale_y,
        }
        enabled_widgets[global_key] = enabled_widgets[current_widgets[selected_idx].key];

        for (let area of Object.keys(widgets)) {
            for (let key of Object.keys(widgets[area])) {
                if (widgets[area][key].global_key == global_key) {
                    widgets[area][key].gui.x = enabled_widgets["GLOBAL_DEFAULTS"][global_key].x;
                    widgets[area][key].gui.y = enabled_widgets["GLOBAL_DEFAULTS"][global_key].y;
                    widgets[area][key].gui.scale_x = enabled_widgets["GLOBAL_DEFAULTS"][global_key].scale_x;
                    widgets[area][key].gui.scale_y = enabled_widgets["GLOBAL_DEFAULTS"][global_key].scale_y;
                    widgets[area][key].gui.save();
                    enabled_widgets[key] = enabled_widgets[global_key];
                }
            }
        }

        ChatLib.chat(`§6The GUI widget settings for §r"${current_widgets[selected_idx].title}§r"§6 has been applied to all islands!`)
    }

    let functions = {
        empty: false,

        draw: (mouse_x, mouse_y) => {

            if (tab_preview) {
                let names = TabList.getNames();
                let tab_preview_string = "";
                let column = 0;
                for (let idx = 0; names && idx < names.length && idx < 81; idx++) {
                    if (idx !== 0)
                        Renderer.drawRect(Renderer.color(85, 85, 85, 127), (Renderer.screen.width / 2) - 361 + (column * 180), 5 + ((idx % 20) * 9), 179, 8);
                    if (idx % 20 === 0 && idx !== 0) {
                        Renderer.drawString(tab_preview_string, (Renderer.screen.width / 2) - 360 + (column * 180), 5);
                        tab_preview_string = "";
                        column++;
                    }
                    tab_preview_string += `${names[idx]}\n`;
                }
            }

            for (let i = 0; i < current_widgets.length; i++) {
                if (i === selected_idx) continue;
                if (show_hidden || enabled_widgets[current_widgets[i].key])
                    current_widgets[i].gui.deselectedDraw(
                        [],
                        1.0, 
                        enabled_widgets[current_widgets[i].key] ? 1.0 : 0.0, 
                        enabled_widgets[current_widgets[i].key] ? 1.0 : 0.0
                    );
            }
            if (selected_idx >= 0 && (show_hidden || enabled_widgets[current_widgets[selected_idx].key]))
                current_widgets[selected_idx].gui.selectedDraw(
                    mouse_x, mouse_y,
                    [
                        "§6[H]§r", new Checkbox(` Toggle Visibility\n`, toggleVisibilitySelected, () => enabled_widgets[current_widgets[selected_idx].key]),
                        "§6[A]§r", new Button(` Apply Globally\n`, applySelectedGlobally)
                    ],
                    1.0, 
                    enabled_widgets[current_widgets[selected_idx].key] ? 1.0 : 0.2, 
                    enabled_widgets[current_widgets[selected_idx].key] ? 1.0 : 0.2
                );

            selector.draw(mouse_x, mouse_y);
        },
    
        clicked: (mouse_x, mouse_y, button) => {
            if (selector.inArea(mouse_x, mouse_y)) {
                selector.clicked(mouse_x, mouse_y, button);
                return;
            }
            
            if (selected_idx < 0 || !current_widgets[selected_idx].gui.inTooltip(mouse_x, mouse_y))
                for (let i = 0; i < current_widgets.length; i++) {
                    if (!show_hidden && !enabled_widgets[current_widgets[i].key]) continue;
                    if (current_widgets[i].gui.inArea(mouse_x, mouse_y))
                        selected_idx = i;
                }

            point_aligns = [];
            x_axis_aligns = [];
            y_axis_aligns = [];
            for (let i = 0; aligning && i < current_widgets.length; i++) {
                if (!show_hidden && !enabled_widgets[current_widgets[i].key] || selected_idx == i) continue;
                let bottom_left_corner = current_widgets[i].gui.getCorners()[3];
                point_aligns.push({x: bottom_left_corner[0], y: bottom_left_corner[1] + 9});
                x_axis_aligns.push(current_widgets[i].gui.x);
                y_axis_aligns.push(current_widgets[i].gui.y);
            }

            if (selected_idx < 0) return;
                current_widgets[selected_idx].gui.mouseClicked(mouse_x, mouse_y, button);
        },
    
        mouseDragged: (mouse_x, mouse_y, button) => {
            if (selected_idx < 0) return;
            current_widgets[selected_idx].gui.mouseDragged(mouse_x, mouse_y, button, point_aligns, x_axis_aligns, y_axis_aligns);
        },
        
        mouseReleased: (mouse_x, mouse_y, button) => {
            for (let i = 0; i < current_widgets.length; i++) {
                current_widgets[i].gui.mouseReleased(mouse_x, mouse_y, button);
            }
        },
    
        keyTyped: (char, key) => {
            if (selected_idx < 0) return;
            switch (key) {
                case 35: // h: hide and show
                    toggleVisibilitySelected();
                    break;
                case 30: // a: apply globally
                    applySelectedGlobally();
                    break;
                default:
                    current_widgets[selected_idx].gui.keyTyped(char, key);
            }
        },
        
        closed: () => {
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
    gui.registerDraw( widget_functions.draw );
    gui.registerClicked( widget_functions.clicked );
    gui.registerMouseDragged( widget_functions.mouseDragged );
    gui.registerMouseReleased( widget_functions.mouseReleased );
    gui.registerKeyTyped( widget_functions.keyTyped );
    gui.registerClosed( widget_functions.closed );
    gui.open();
};

