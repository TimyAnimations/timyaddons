import Settings from "../utils/settings/main";
import { MoveableDisplay } from "../utils/moveable_display";
import { getArea, getClosedContainer, getContainer, registerArea, registerCloseContainer, registerContainer } from "../utils/skyblock";
import { Button, Checkbox, GuiMenu, Label, Row } from "../utils/menu_gui";
import { getBroodmotherDisplay } from "./bestiary/broodmother";
import { getPlotMinimapGui } from "./garden/minimap";
import { getSlayerRatesDisplay } from "./slayer/rates";

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
var applied_globals = new Set();

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
            widgets[area][key] = {
                gui: enabled_widgets["GLOBAL_DEFAULTS"][global_key] 
                        ? new MoveableDisplay(`${key}_widget_display`, enabled_widgets["GLOBAL_DEFAULTS"][global_key].x, enabled_widgets["GLOBAL_DEFAULTS"][global_key].y, 10, 10,
                                                                       enabled_widgets["GLOBAL_DEFAULTS"][global_key].scale_x, enabled_widgets["GLOBAL_DEFAULTS"][global_key].scale_y) 
                        : new MoveableDisplay(`${key}_widget_display`, 10, current_height), 
                key: key, global_key: global_key, title: title
            };
            if (!enabled_widgets[key]) enabled_widgets[key] = enabled_widgets[global_key] ?? Settings.widgets_enable_default;
            
            const this_widget = widgets[area][key];
            if (applied_globals.has(global_key)) {
                this_widget.gui.x = enabled_widgets["GLOBAL_DEFAULTS"][global_key].x;
                this_widget.gui.y = enabled_widgets["GLOBAL_DEFAULTS"][global_key].y;
                this_widget.gui.scale_x = enabled_widgets["GLOBAL_DEFAULTS"][global_key].scale_x;
                this_widget.gui.scale_y = enabled_widgets["GLOBAL_DEFAULTS"][global_key].scale_y;
                this_widget.gui.save();
                enabled_widgets[this_widget.key] = enabled_widgets[global_key];
            }
            
            const toggleVisibility = () => {
                enabled_widgets[this_widget.key] = !enabled_widgets[this_widget.key];
            }
            const applyGlobally = () => {
                enabled_widgets["GLOBAL_DEFAULTS"][this_widget.global_key] = {
                    x: this_widget.gui.x,
                    y: this_widget.gui.y,
                    scale_x: this_widget.gui.scale_x,
                    scale_y: this_widget.gui.scale_y,
                }
                applied_globals.add(this_widget.global_key);
                enabled_widgets[this_widget.global_key] = enabled_widgets[this_widget.key];
                FileLib.write(IMPORT_NAME, LOCATION_DATA_FILE, JSON.stringify(enabled_widgets));
        
                for (let area_ of Object.keys(widgets)) {
                    for (let key_ of Object.keys(widgets[area_])) {
                        if (widgets[area_][key_].global_key == this_widget.global_key) {
                            widgets[area_][key_].gui.x = enabled_widgets["GLOBAL_DEFAULTS"][this_widget.global_key].x;
                            widgets[area_][key_].gui.y = enabled_widgets["GLOBAL_DEFAULTS"][this_widget.global_key].y;
                            widgets[area_][key_].gui.scale_x = enabled_widgets["GLOBAL_DEFAULTS"][this_widget.global_key].scale_x;
                            widgets[area_][key_].gui.scale_y = enabled_widgets["GLOBAL_DEFAULTS"][this_widget.global_key].scale_y;
                            widgets[area_][key_].gui.save();
                            enabled_widgets[key_] = enabled_widgets[this_widget.global_key];
                        }
                    }
                }
        
                ChatLib.chat(`§6The GUI widget settings for §r"${this_widget.title}§r"§6 has been applied to all islands!`)
            }
            this_widget.gui.addTooltipContent(
                [
                    new Label("§6[H]§r"), new Checkbox(` Toggle Visibility\n`, toggleVisibility, () => {return enabled_widgets[this_widget.key];}),
                    new Label("§6[A]§r"), new Button(` Apply Globally\n`, applyGlobally)
                ]
            );
            this_widget.gui.addKeyFunction(35, toggleVisibility);
            this_widget.gui.addKeyFunction(30, applyGlobally);
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
var non_tab_widgets = true;
function initiateWidgitGui() {
    if (!area || !(area in widgets)) {
        return;
    }

    const other_widgets = [];
    if (non_tab_widgets && Settings.bestiary_broodmother_timer && getArea() === "Spider's Den") {
        other_widgets.push({gui: getBroodmotherDisplay(), key: undefined});
    }
    if (non_tab_widgets && Settings.garden_plot_minimap && getArea() === "Garden") {
        other_widgets.push({gui: getPlotMinimapGui(), key: undefined});
    }
    if (non_tab_widgets && Settings.slayer_track_rates && !["Garden", "Private Island", "Dungeon Hub", "Dungeon"].includes(getArea())) {
        other_widgets.push({gui: getSlayerRatesDisplay(), key: undefined});
    }
    const current_widgets = [...Object.values(widgets[area]), ...other_widgets];
    let selected_idx = -1;
    
    let selector = new GuiMenu(110, -110, [
        new Label("§6§lGUI Tab Widget§r\n").alignCenter().setBackgroundColor(Renderer.color(85, 85, 85, 85)),
        ...current_widgets.map((widget, idx) => {
            if (!widget.key) return undefined;
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
        }).filter((value) => value !== undefined),
        new Label("\n"),
        new Label("§6§lSettings§r\n").alignCenter().setBackgroundColor(Renderer.color(85, 85, 85, 85)),
        new Checkbox("  Show Hidden\n", () => { show_hidden = !show_hidden }, () => show_hidden ),
        new Checkbox("  Snap to Align\n", () => { aligning = !aligning }, () => aligning ),
        new Checkbox("  Tab Preview\n", () => { tab_preview = !tab_preview }, () => tab_preview ),
        new Checkbox(
            "  Edit Non-Tab Widgets\n", 
            () => {
                non_tab_widgets = !non_tab_widgets;
                widget_functions = initiateWidgitGui(); 
            }, 
            () => non_tab_widgets
        ),
        new Label("\n"),
        new Row(
            new Button(
                " §0Reset ", 
                () => {
                    for (let i = 0; i < current_widgets.length; i++) {
                        current_widgets[i].gui.reset();
                    }
                }
            ).setBackgroundColor(Renderer.color(255, 85, 85)).alignCenter(),
            new Button(
                " §0Refresh ",
                () => {widget_functions = initiateWidgitGui();}
            ).setBackgroundColor(Renderer.color(85, 255, 85)).alignCenter()
        )
    ]);
    selector.setAnchor(0.5, 0.5);

    let point_aligns = [];
    let x_axis_aligns = [];
    let y_axis_aligns = [];

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
                if (show_hidden || (enabled_widgets[current_widgets[i].key] ?? true))
                    current_widgets[i].gui.deselectedDraw(
                        1.0, 
                        (enabled_widgets[current_widgets[i].key] ?? true) ? 1.0 : 0.0, 
                        (enabled_widgets[current_widgets[i].key] ?? true) ? 1.0 : 0.0
                    );
            }
            if (selected_idx >= 0 && (show_hidden || (enabled_widgets[current_widgets[selected_idx].key] ?? true)))
                current_widgets[selected_idx].gui.selectedDraw(
                    mouse_x, mouse_y,
                    1.0, 
                    (enabled_widgets[current_widgets[selected_idx].key] ?? true) ? 1.0 : 0.2, 
                    (enabled_widgets[current_widgets[selected_idx].key] ?? true) ? 1.0 : 0.2
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
                    if (!show_hidden && !(enabled_widgets[current_widgets[i].key] ?? true)) continue;
                    if (current_widgets[i].gui.inArea(mouse_x, mouse_y))
                        selected_idx = i;
                }

            point_aligns = [];
            x_axis_aligns = [];
            y_axis_aligns = [];
            for (let i = 0; aligning && i < current_widgets.length; i++) {
                if (!show_hidden && !(enabled_widgets[current_widgets[i].key] ?? true) || selected_idx == i) continue;
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
            current_widgets[selected_idx].gui.keyTyped(char, key);
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

