import { Label, Button, Checkbox, GuiMenu, Row, Line } from "./menu_gui";
import Settings from "./settings/main";

const IMPORT_NAME = "TimyAddons/data"
const LOCATION_DATA_FILE = "moveable_gui_locations.json"

const GRAB_EDGE_THRESHOLD = 6;

const current_guis = [];
let waiting_for_parent = {};

export class MoveableGui {
    constructor(name, draw_func = () => {}, init_x = 10, init_y = 10, init_width = 10, init_height = 10, init_scale_x = 1.0, init_scale_y = undefined) {
        this.name = name;

        this.init_x = init_x;
        this.init_y = init_y;
        this.init_scale_x = init_scale_x;
        this.init_scale_y = init_scale_y ?? init_scale_x;
        this.x = init_x;
        this.y = init_y;
        this.scale_x = init_scale_x;
        this.scale_y = this.init_scale_y;

        this.pin_x = 0.0;
        this.pin_y = 0.0;
        this.align_x = 0.0;
        this.align_y = 0.0;

        this.parent = undefined;
        this.root_parent = undefined;
        this.parented_corner_idx = 0;
        this.child = undefined;
        
        this.width = init_width;
        this.height = init_height;
        
        this.safeLoad(init_x, init_y, init_scale_x, this.init_scale_y);

        this.grab_area = undefined;
        this.mouse_grab_loc = undefined;
        this.grabbed_pin = false;
        this.grabbed_align = false;
        this.auto_align_x = true;
        this.auto_align_y = false;

        this.last_x = this.x;
        this.last_y = this.y;
        this.opposite_corner_x = this.x + this.width * this.scale_x;
        this.opposite_corner_y = this.y + this.height * this.scale_y;
        this.grab_edge_x = 0;
        this.grab_edge_y = 0;

        this.visual_aligning_x = undefined;
        this.visual_aligning_y = undefined;

        this.key_functions = {};

        this.save_action = () => {};

        this.draw_func = draw_func;
        this.draw = (...args) => {
            if (this.gui.isOpen()) return;
            Renderer.retainTransforms(true);
            Renderer.translate(this.getX() + MoveableGui.screenX(), this.getY() + MoveableGui.screenY());
            Renderer.scale(this.scale_x, this.scale_y);
            this.draw_func(this.getX() + MoveableGui.screenX(), this.getY() + MoveableGui.screenY(), this.size_x, this.size_y, ...args);
            Renderer.retainTransforms(false);
        }

        this.tooltip = new GuiMenu().setBackgroundColor(Renderer.color(0, 0, 0, 225));
        this.tooltip_content = [
            new Label("Alignment:\n"), 
            new Label(" x "), 
            new Row(
                new Checkbox("Auto", () => { this.auto_align_x = !this.auto_align_x }, () => { return this.auto_align_x }),
                new Button(" Left ", () => { this.alignLeft(); this.auto_align_x = false; }).alignCenter().setBackgroundColor(Renderer.color(85, 85, 85, 85)),
                new Button(" Center ", () => { this.alignCenterX(); this.auto_align_x = false; }).alignCenter().setBackgroundColor(Renderer.color(85, 85, 85, 85)),
                new Button(" Right ", () => { this.alignRight(); this.auto_align_x = false; }).alignCenter().setBackgroundColor(Renderer.color(85, 85, 85, 85)),
            ).setGap(1),
            new Line(1),
            new Label(" y "), 
            new Row(
                new Checkbox("Auto", () => { this.auto_align_y = !this.auto_align_y }, () => { return this.auto_align_y }),
                new Button(" Top ", () => { this.alignTop(); this.auto_align_y = false; }).alignCenter().setBackgroundColor(Renderer.color(85, 85, 85, 85)),
                new Button(" Center ", () => { this.alignCenterY(); this.auto_align_y = false; }).alignCenter().setBackgroundColor(Renderer.color(85, 85, 85, 85)),
                new Button(" Bottom ", () => { this.alignBottom(); this.auto_align_y = false; }).alignCenter().setBackgroundColor(Renderer.color(85, 85, 85, 85)),
            ).setGap(1),
            new Line(1),
            new Label("§6[R]&r"), new Button(" §cReset\n", () => { this.reset(); }), 
        ];
        this.child_tooltip_content = [
            new Line(1),
            new Button("&cUnparent\n", () => { this.removeParent(); }),
            new Label("§6[R]&r"), new Button(" §cReset\n", () => { this.reset(); }), 
        ];

        this.gui = new Gui();
        
        this.gui.registerDraw((mouse_x, mouse_y) => { this.selectedDraw(mouse_x, mouse_y); });
        this.gui.registerClosed(() => {
            this.save();
        });
        this.gui.registerMouseDragged((...args) => { this.mouseDragged(...args); });
        this.gui.registerClicked((...args) => { this.mouseClicked(...args); });
        this.gui.registerMouseReleased((...args) => { this.mouseReleased(...args); });
        this.gui.registerKeyTyped((...args) => { this.keyTyped(...args); });

        current_guis.push(this);
    }

    selectedDraw(mouse_x, mouse_y, r = 1.0, g = 1.0, b = 1.0) {
        Renderer.retainTransforms(true);
        Renderer.translate(this.getX() + MoveableGui.screenX(), this.getY() + MoveableGui.screenY());
        Renderer.scale(this.scale_x, this.scale_y);
        this.draw_func(this.getX() + MoveableGui.screenX(), this.getY() + MoveableGui.screenY(), this.size_x, this.size_y);
        Renderer.retainTransforms(false);
    
        const [render_x, render_y] = [this.getX() + MoveableGui.screenX(), this.getY() + MoveableGui.screenY()]
        const scale_string = this.scale_x == this.scale_y 
                                ? `scale: ${this.scale_x.toFixed(2)}` 
                                : `scale x: ${this.scale_x.toFixed(2)}, scale y: ${this.scale_y.toFixed(2)}`
        
        const corners = this.getCorners().map((corner) => [corner[0] + MoveableGui.screenX(), corner[1] + MoveableGui.screenY()]);

        if (this.parent) {
            this.tooltip.setContent([
                new Label(`x: ${this.getX().toFixed(1)}, y: ${this.getY().toFixed(1)}, ${scale_string}\n`),
                new Label(`Child of &7&n${this.parent.name}\n`),
                ...this.child_tooltip_content
            ]);
        }
        else {
            this.tooltip.setContent([
                new Label(`x: ${this.getX().toFixed(1)}, y: ${this.getY().toFixed(1)}, ${scale_string}\n`),
                ...this.tooltip_content
            ]);
        }
        
        const tooltip_x = render_x < 0 ? 0 : ( render_x < Renderer.screen.getWidth() - this.tooltip.width ? render_x : Renderer.screen.getWidth() - this.tooltip.width );
        if (render_y > MoveableGui.screenHeight() / 2) {
            this.tooltip.setPosition(tooltip_x, render_y - 1);
            this.tooltip.setAlign(0.0, 1.0);
        }
        else {
            this.tooltip.setPosition(tooltip_x, corners[3][1] + 4);
            this.tooltip.setAlign(0.0, 0.0);
        }
        
        this.tooltip.draw(mouse_x, mouse_y);
        GL11.glLineWidth(Renderer.screen.getScale());

        Renderer.drawShape(Renderer.color(Math.floor(230 * r), Math.floor(230 * g), Math.floor(230 * b), 230), corners, 2);
        corners.forEach((corner) => {
            Renderer.drawRect(Renderer.color(Math.floor(255 * r), Math.floor(255 * g), Math.floor(255 * b), 255), corner[0] - 2, corner[1] - 2, 4, 4);
        });

        if (this.visual_aligning_x)
            Renderer.drawLine(Renderer.color(127, 200, 255, 127), this.visual_aligning_x + MoveableGui.screenX(), MoveableGui.screenY(), this.visual_aligning_x + MoveableGui.screenX(), MoveableGui.screenY() + MoveableGui.screenHeight(), 1);
        if (this.visual_aligning_y)
            Renderer.drawLine(Renderer.color(127, 200, 255, 127), MoveableGui.screenX(), this.visual_aligning_y + MoveableGui.screenY(), MoveableGui.screenX() + MoveableGui.screenWidth(), this.visual_aligning_y + MoveableGui.screenY(), 1);

        const [pin_x, pin_y] = [this.getPinX() + MoveableGui.screenX(), this.getPinY() + MoveableGui.screenY()]
        Renderer.drawLine(Renderer.color(127, 255, 200, 200), pin_x - 5, pin_y, pin_x + 5, pin_y, 2);
        Renderer.drawLine(Renderer.color(127, 255, 200, 200), pin_x, pin_y - 5, pin_x, pin_y + 5, 2);

        Renderer.drawLine(
            Renderer.color(127, 200, 255, 200), 
            this.getX() + this.getRelativeAlignX() - 5 + MoveableGui.screenX(), this.getY() + this.getRelativeAlignY() + MoveableGui.screenY(),
            this.getX() + this.getRelativeAlignX() + 5 + MoveableGui.screenX(), this.getY() + this.getRelativeAlignY() + MoveableGui.screenY(), 2
        );
        Renderer.drawLine(
            Renderer.color(127, 200, 255, 200), 
            this.getX() + this.getRelativeAlignX() + MoveableGui.screenX(), this.getY() + this.getRelativeAlignY() - 5 + MoveableGui.screenY(), 
            this.getX() + this.getRelativeAlignX() + MoveableGui.screenX(), this.getY() + this.getRelativeAlignY() + 5 + MoveableGui.screenY(), 2
        );
    }
    
    deselectedDraw(r = 1.0, g = 1.0, b = 1.0) {
        Renderer.retainTransforms(true);
        Renderer.translate(this.getX() + MoveableGui.screenX(), this.getY() + MoveableGui.screenY());
        Renderer.scale(this.scale_x, this.scale_y);
        this.draw_func(this.getX() + MoveableGui.screenX(), this.getY() + MoveableGui.screenY(), this.size_x, this.size_y);
        Renderer.retainTransforms(false);
        GL11.glLineWidth(Renderer.screen.getScale());
        
        const corners = this.getCorners().map((corner) => [corner[0] + MoveableGui.screenX(), corner[1] + MoveableGui.screenY()]);
        Renderer.drawShape(Renderer.color(Math.floor(130 * r), Math.floor(130 * g), Math.floor(130 * b), 130), corners, 2);
    }

    mouseDragged(mouse_x, mouse_y, button, point_aligns = [], x_axis_aligns = [], y_axis_aligns = []) {
        if (!this.mouse_grab_loc) return;
        mouse_x -= MoveableGui.screenX();
        mouse_y -= MoveableGui.screenY();
        // drag
        if (this.grabbed_pin) {
            let new_x = mouse_x - this.mouse_grab_loc.x;
            let new_y = mouse_y - this.mouse_grab_loc.y;
            this.setPinX(new_x);
            this.setPinY(new_y);
            return;
        }

        if (this.grab_edge_x === 0 && this.grab_edge_y === 0) {
            let new_x = mouse_x - this.mouse_grab_loc.x;
            let new_y = mouse_y - this.mouse_grab_loc.y;

            this.visual_aligning_x = undefined;
            this.visual_aligning_y = undefined;
            
            if (this.gui.isShiftDown()) {
                if (Math.abs( new_x - this.last_x ) > Math.abs( new_y - this.last_y ))
                    new_y = this.last_y;
                else
                    new_x = this.last_x;
            }
            else {
                const SNAP_DISTANCE = 5;
                let closest_distance_sq = SNAP_DISTANCE**2;
                let closest_point_align = undefined;
                point_aligns?.forEach((point_align) => {
                    const distance_sq = (new_x - point_align.x + this.getRelativeAlignX())**2 + (new_y - point_align.y + this.getRelativeAlignY())**2;
                    if (distance_sq < closest_distance_sq) {
                        closest_distance_sq = distance_sq;
                        closest_point_align = {x: point_align.x - this.getRelativeAlignX(), y: point_align.y - this.getRelativeAlignY()};
                    }
                });
                if (closest_point_align) {
                    new_x = closest_point_align.x;
                    new_y = closest_point_align.y;
                    this.visual_aligning_x = closest_point_align.x + this.getRelativeAlignX();
                    this.visual_aligning_y = closest_point_align.y + this.getRelativeAlignY();
                }
                else {
                    let closest_x_distance = SNAP_DISTANCE;
                    let closest_x_axis_align = undefined;
                    x_axis_aligns?.forEach((x_axis_align) => {
                        const distance = Math.abs(new_x - x_axis_align + this.getRelativeAlignX());
                        if (distance < closest_x_distance) {
                            closest_x_distance = distance;
                            closest_x_axis_align = x_axis_align - this.getRelativeAlignX();
                        }
                    })
                    if (closest_x_axis_align) {
                        new_x = closest_x_axis_align;
                        this.visual_aligning_x = closest_x_axis_align + this.getRelativeAlignX();
                    }
                    
                    let closest_y_distance = SNAP_DISTANCE;
                    let closest_y_axis_align = undefined;
                    y_axis_aligns?.forEach((y_axis_align) => {
                        const distance = Math.abs(new_y - y_axis_align + this.getRelativeAlignY());
                        if (distance < closest_y_distance) {
                            closest_y_distance = distance;
                            closest_y_axis_align = y_axis_align - this.getRelativeAlignY();
                        }
                    })
                    if (closest_y_axis_align) {
                        new_y = closest_y_axis_align;
                        this.visual_aligning_y = closest_y_axis_align + this.getRelativeAlignY();
                    }
                }
            }
            if (this.gui.isControlDown()) {
                new_x = (new_x * 0.1) + (this.last_x * 0.9);
                new_y = (new_y * 0.1) + (this.last_y * 0.9);
            }

            this.setX(new_x);
            this.setY(new_y);
            this.removeParent();

            if (this.auto_align_x) {
                const new_x_percent = new_x / MoveableGui.screenWidth();
                if (new_x_percent < 0.4) this.alignLeft();
                else if (new_x_percent > 0.6) this.alignRight();
                else this.alignCenterX();
            }
            if (this.auto_align_y) {
                const new_y_percent = new_y / MoveableGui.screenHeight();
                if (new_y_percent < 0.4) this.alignTop();
                else if (new_y_percent > 0.6) this.alignBottom();
                else this.alignCenterY();
            }

            return;
        }
        
        // scale
        let scale_x = 0;
        let scale_y = 0;
        if (this.grab_edge_x) {
            scale_x = this.grab_edge_x === 1 
                ? (mouse_x - this.getX()) / this.width 
                :(-mouse_x + this.opposite_corner_x) / this.width;
            if (scale_x < 0.1) scale_x = 0.1;
        }
        if (this.grab_edge_y) {
            scale_y = this.grab_edge_y === 1 
                ? (mouse_y - this.getY()) / this.height 
                :(-mouse_y + this.opposite_corner_y) / this.height;
            if (scale_y < 0.1) scale_y = 0.1;
        }

        if (this.gui.isShiftDown()) {
            this.scale_x = scale_x ? scale_x : this.scale_x;
            this.scale_y = scale_y ? scale_y : this.scale_y;
        }
        else {
            const aspect_ratio = this.scale_x / this.scale_y;
            if (scale_x > scale_y * aspect_ratio) {
                this.scale_x = scale_x;
                this.scale_y = scale_x / aspect_ratio;
            }
            else {
                this.scale_x = scale_y * aspect_ratio;
                this.scale_y = scale_y;
            }
        }

        if (this.grab_edge_x === -1) 
            this.setX(this.opposite_corner_x - (this.width * this.scale_x));
        if (this.grab_edge_y === -1)
            this.setY(this.opposite_corner_y - (this.height * this.scale_y));
        
    }

    mouseClicked(mouse_x, mouse_y, button) {
        if (this.inTooltip(mouse_x, mouse_y)) {
            this.tooltip.clicked(mouse_x, mouse_y, button);
            return true;
        }
        mouse_x -= MoveableGui.screenX();
        mouse_y -= MoveableGui.screenY();
        
        this.grabbed_pin = false;
        this.grabbed_align = false;
        const distance_sq_to_pin = (mouse_x - this.getPinX())**2 + (mouse_y - this.getPinY())**2;
        if (distance_sq_to_pin < 25) {
            this.grabbed_pin = true;
            this.last_x = this.getPinX();
            this.last_y = this.getPinY();
            this.mouse_grab_loc = {
                x: mouse_x - this.getPinX(),
                y: mouse_y - this.getPinY()
            };
            return;
        }

        this.setGrabArea();
        
        this.last_x = this.getX();
        this.last_y = this.getY();
        this.opposite_corner_x = this.getX() + this.width * this.scale_x;
        this.opposite_corner_y = this.getY() + this.height * this.scale_y;
        this.grab_edge_x = 0;
        this.grab_edge_y = 0;

        const relative_x = mouse_x - this.getX();
        const relative_y = mouse_y - this.getY();
        
        if (this.grab_area && (relative_x < this.grab_area.x.min || relative_x > this.grab_area.x.max ||
            relative_y < this.grab_area.y.min || relative_y > this.grab_area.y.max))
        {
            if (relative_y >= this.grab_area.y.min -GRAB_EDGE_THRESHOLD && relative_y <= (this.grab_area.y.max) + GRAB_EDGE_THRESHOLD) {
                if (relative_x < this.grab_area.x.min && relative_x >= this.grab_area.x.min - GRAB_EDGE_THRESHOLD)
                    this.grab_edge_x = -1;
                if (relative_x > this.grab_area.x.max && relative_x <= (this.grab_area.x.max) + GRAB_EDGE_THRESHOLD)
                    this.grab_edge_x = 1;
            }
            if (relative_x >= this.grab_area.x.min -GRAB_EDGE_THRESHOLD && relative_x <= (this.grab_area.x.max) + GRAB_EDGE_THRESHOLD) {
                if (relative_y < this.grab_area.y.min && relative_y >= this.grab_area.y.min - GRAB_EDGE_THRESHOLD)
                    this.grab_edge_y = -1;
                if (relative_y > this.grab_area.y.max && relative_y <= (this.grab_area.y.max) + GRAB_EDGE_THRESHOLD)
                    this.grab_edge_y = 1;
            }

            if (this.grab_edge_x === 0 && this.grab_edge_y === 0) return false;
        }
        this.mouse_grab_loc = {
            x: relative_x,
            y: relative_y
        };
        return true;
    }

    inTooltip(x, y) {
        return this.tooltip !== undefined && this.tooltip.inArea(x, y);
    }

    mouseReleased(mouse_x, mouse_y, button) {
        this.mouse_grab_loc = undefined;
        this.visual_aligning_x = undefined;
        this.visual_aligning_y = undefined;
    }

    keyTyped(char, key) {
        const aspect_ratio = this.scale_x / this.scale_y;
        switch (key) {
            case 19: // r (reset)
                this.reset();
                break;
            case 200: this.y = Math.floor(this.y - 1); break; // up
            case 208: this.y = Math.floor(this.y + 1); break; // down
            case 205: this.x = Math.floor(this.x + 1); break; // right
            case 203: this.x = Math.floor(this.x - 1); break; // left
            case 12: // minus (scale)
                this.scale_x -= 0.1;
                if (this.scale_x < 0.1) this.scale_x = 0.1;
                this.scale_y = this.scale_x / aspect_ratio;
                break; 
            case 13: // plus (scale)
                this.scale_x += 0.1;
                if (this.scale_x < 0.1) this.scale_x = 0.1;
                this.scale_y = this.scale_x / aspect_ratio;
                break;
            default:
                if (this.key_functions[key])
                    this.key_functions[key]();
        }
    }

    addKeyFunction(key, invoke_func) {
        this.key_functions[key] = invoke_func;
    }

    safeLoad(init_x = 10, init_y = 10, init_scale_x = 1.0, init_scale_y = init_scale_x) {
        let location_file = FileLib.exists(IMPORT_NAME, LOCATION_DATA_FILE) 
                                ? FileLib.read(IMPORT_NAME, LOCATION_DATA_FILE)
                                : undefined;
        let saved_data = {};
        if (location_file)
            saved_data = JSON.parse(location_file);
        
        let parent_name = "";
        if (this.name in saved_data) {
            this.x = saved_data[this.name].x ?? init_x;
            this.y = saved_data[this.name].y ?? init_y;
            this.scale_x = saved_data[this.name].scale_x ?? init_scale_x;
            this.scale_y = saved_data[this.name].scale_y ?? init_scale_y;
            this.pin_x = saved_data[this.name].pin_x ?? 0.0;
            this.pin_y = saved_data[this.name].pin_y ?? 0.0;
            this.align_x = saved_data[this.name].align_x ?? 0.0;
            this.align_y = saved_data[this.name].align_y ?? 0.0;
            parent_name = saved_data[this.name].parent ?? "";
        }
        else {
            saved_data[this.name] = {x: init_x, y: init_y, scale_x: init_scale_x, scale_y: init_scale_y, 
                                     pin_x: 0.0, pin_y: 0.0, align_x: 0.0, align_y: 0.0, parent: ""};
            FileLib.write(IMPORT_NAME, LOCATION_DATA_FILE, JSON.stringify(saved_data));
        }

        if (parent_name !== "") {
            const found_parent = current_guis.find((gui) => gui.name === parent_name);
            if (found_parent) {
                this.setParent(found_parent);
            }
            else {
                waiting_for_parent[parent_name] = this;
            }
        }

        if (this.name in waiting_for_parent) {
            waiting_for_parent[this.name].setParent(this);
            delete waiting_for_parent[this.name];
        }
    }
    
    save() {
        let location_file = FileLib.read(IMPORT_NAME, LOCATION_DATA_FILE);
        let saved_data = {};
        if (location_file)
            saved_data = JSON.parse(location_file);

        saved_data[this.name] = {x: this.x, y: this.y, scale_x: this.scale_x, scale_y: this.scale_y, 
                                 pin_x: this.pin_x, pin_y: this.pin_y, align_x: this.align_x, align_y: this.align_y, 
                                 parent: this.parent?.name ?? ""};
        FileLib.write(IMPORT_NAME, LOCATION_DATA_FILE, JSON.stringify(saved_data));

        this.save_action();
    }

    edit() {
        this.gui.open();
        this.setGrabArea();
    }

    reset() {
        this.pin_x = 0.0;
        this.pin_y = 0.0;
        this.align_x = 0.0;
        this.align_y = 0.0;
        this.setX(this.init_x);
        this.setY(this.init_y);
        this.scale_x = this.init_scale_x;
        this.scale_y = this.init_scale_y;
        this.removeParent();
    }

    setGrabArea(x_min = undefined, y_min = undefined, x_max = undefined, y_max = undefined) {
        this.grab_area = {
            x: {min: x_min ?? GRAB_EDGE_THRESHOLD / 2, max: x_max ?? (this.width * this.scale_x) - (GRAB_EDGE_THRESHOLD / 2)},
            y: {min: y_min ?? GRAB_EDGE_THRESHOLD / 2, max: y_max ?? (this.height * this.scale_y) - (GRAB_EDGE_THRESHOLD / 2)}
        }
    }

    inArea(x, y) {
        const relative_x = x - this.getX() - MoveableGui.screenX();
        const relative_y = y - this.getY() - MoveableGui.screenY();
        let opposite_corner_x = this.width * this.scale_x;
        let opposite_corner_y = this.height * this.scale_y;
        return relative_x >= 0 && relative_x <= opposite_corner_x && relative_y >= 0 && relative_y <= opposite_corner_y;
    }
    
    setRenderLoc(render_x, render_y) {
        this.setX(render_x);
        this.setY(render_y);
    }
    setX(render_x) {
        render_x = MoveableGui.clamp(render_x, 0, MoveableGui.screenWidth() - this.width);
        this.x = render_x + this.getRelativeAlignX() - this.getPinX();
        if (this.child) {
            this.child.align_x = this.align_x;
            this.child.pin_x = this.pin_x;
            this.child.setX(render_x + ((this.width * this.scale_x) - (this.child.width * this.child.scale_x)) * this.align_x);
        }
    }
    setY(render_y) {
        render_y = MoveableGui.clamp(render_y, 0, MoveableGui.screenHeight() - this.height);
        this.y = render_y + this.getRelativeAlignY() - this.getPinY();
        if (this.child) {
            this.child.align_y = 0.0;
            this.child.pin_y = this.pin_y;
            this.child.setY(render_y + (this.height * this.scale_y) + 9);
        }
    }
    getX() {
        return this.x - this.getRelativeAlignX() + this.getPinX();
    }
    getY() {
        return this.y - this.getRelativeAlignY() + this.getPinY();
    }
    refreshX() {
        const render_x = this.getX();
        this.setX(render_x);
    }
    refreshY() {
        const render_y = this.getY();
        this.setY(render_y);
    }
    setWidth(width) {
        if (this.width === width)
            return;
        this.width = width;
        this.refreshX();
    }
    setHeight(height) {
        if (this.height === height)
            return;
        this.height = height;
        this.refreshY();
    }

    static clamp(value, low, high) {
        return value < low ? low : (value > high ? high : value);
    }

    getPinX() {
        return this.pin_x * MoveableGui.screenWidth();
    }
    getPinY() {
        return this.pin_y * MoveableGui.screenHeight();
    }
    setPinX(x) {
        const render_x = this.getX();
        this.pin_x = x / MoveableGui.screenWidth();
        if (this.pin_x < 0.0) this.pin_x = 0.0;
        if (this.pin_x > 1.0) this.pin_x = 1.0;
        this.setX(render_x);
    }
    setPinY(y) {
        const render_y = this.getY();
        this.pin_y = y / MoveableGui.screenHeight();
        if (this.pin_y < 0.0) this.pin_y = 0.0;
        if (this.pin_y > 1.0) this.pin_y = 1.0;
        this.setY(render_y);
    }

    setAlignX(align_x) {
        const render_x = this.getX();
        this.align_x = align_x;
        this.setX(render_x);
    }
    setAlignY(align_y) {
        const render_y = this.getY();
        this.align_y = align_y;
        this.setY(render_y);
    }
    getRelativeAlignX() {
        return this.align_x * this.width * this.scale_x;
    }
    getRelativeAlignY() {
        return this.align_y * this.height * this.scale_y;
    }

    alignLeft() {
        const render_x = this.getX();
        this.pin_x = 0.0;
        this.align_x = 0.0;
        this.setX(render_x);
    }
    alignRight() {
        const render_x = this.getX();
        this.pin_x = 1.0;
        this.align_x = 1.0;
        this.setX(render_x);
    }
    alignCenterX() {
        const render_x = this.getX();
        this.pin_x = 0.5;
        this.align_x = 0.5;
        this.setX(render_x);
    }
    
    alignTop() {
        const render_y = this.getY();
        this.pin_y = 0.0;
        this.align_y = 0.0;
        this.setY(render_y);
    }
    alignBottom() {
        const render_y = this.getY();
        this.pin_y = 1.0;
        this.align_y = 1.0;
        this.setY(render_y);
    }
    alignCenterY() {
        const render_y = this.getY();
        this.pin_y = 0.5;
        this.align_y = 0.5;
        this.setY(render_y);
    }
    
    getRelativePos(x, y) {
        return {x: ((x - MoveableGui.screenX()) / this.scale_x) - (this.getX() / this.scale_x) , y: ((y - MoveableGui.screenY()) / this.scale_y) - (this.getY() / this.scale_y)};
    }

    getCorners() {
        return [
            [this.getX(), this.getY()], 
            [this.getX() + this.width * this.scale_x, this.getY()], 
            [this.getX() + this.width * this.scale_x, this.getY() + this.height * this.scale_y], 
            [this.getX(), this.getY() + this.height * this.scale_y]
        ];
    }

    addTooltipContent(content) {
        this.tooltip_content = [...this.tooltip_content, ...content];
        this.child_tooltip_content = [...this.child_tooltip_content, ...content];
        return this;
    }

    setParent(parent) {
        if (parent === this) return this;
        if (!parent) return this.removeParent();
        
        if (parent.child) {
            parent.child.removeParent();
        }

        parent.child = this;
        this.parent = parent;

        if (this.checkParentCycles()) {
            this.parent = undefined;
            parent.child = undefined;
            return this;
        }

        this.parent.refreshX();
        this.parent.refreshY();
        
        return this;
    }
    checkParentCycles() {
        let slow = this.parent;
        let fast = this.parent;
        while (slow !== undefined && fast !== undefined && fast.child !== undefined) {
            slow = slow.child;
            fast = fast.child.child;
            if (slow === fast)
                return true;
        }

        return false;
    }
    removeParent() {
        if (!this.parent) return this;
        
        const render_x = this.getX();
        const render_y = this.getY();
        
        this.parent.child = undefined;
        this.parent = undefined;
        
        this.setX(render_x);
        this.setY(render_y);

        return this;
    }

    static screenWidth() {
        if (!Settings.widget_aspect_ratio)
            return Renderer.screen.getWidth();
    
        const ratio = Renderer.screen.getWidth() / Renderer.screen.getHeight();
        const modifier = ratio * (9.0 / 16.0);
        
        if (modifier <= 1.0) 
            return Renderer.screen.getWidth();
        return Renderer.screen.getWidth() / modifier;
    }
    static screenHeight() {
        return Renderer.screen.getHeight();
        
        // if (!Settings.widget_aspect_ratio)
        //     return Renderer.screen.getHeight();
    
        // const ratio = Renderer.screen.getWidth() / Renderer.screen.getHeight();
        // const modifier = ratio * (9.0 / 16.0);
        
        // if (modifier >= 1.0) 
        //     return Renderer.screen.getHeight();
        // return Renderer.screen.getHeight() * modifier;
    }
    static screenX() {
        if (!Settings.widget_aspect_ratio)
            return 0;
    
        const different = Renderer.screen.getWidth() - MoveableGui.screenWidth();
        return different / 2.0;
    }
    static screenY() {
        return 0;
        
        // if (!Settings.widget_aspect_ratio)
        //     return 0;
    
        // const different = Renderer.screen.getHeight() - MoveableGui.screenHeight();
        // return different / 2.0;
    }
}

export default { MoveableGui, Button, Checkbox, GuiMenu };