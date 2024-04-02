import { stringWidth } from "./format";
import { drawCheckbox } from "./render";

const HEIGHT = 9;
export class Label {
    constructor(text) {
        this.text = text;
        this.align_x = 0.0;
        this.background_color = undefined;
        
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.container_width = 0;
        this.background_fill = true;

        this.gap = 0;

        this.endline = /.*\n$/.test(text);
    }

    draw(mouse_x, mouse_y, parent_x = 0, parent_y = 0, highlight = false) {
        this.drawBackground(parent_x, parent_y, this.background_color);
        Renderer.drawString(this.text, parent_x + this.getStartX(), parent_y + this.getY());
    }

    clicked() {}
    key() {}

    drawBackground(parent_x, parent_y, color = undefined) {
        if (!color) return;
        const x = this.getContainerX() - 1;
        const y = this.getY() - 1;
        const width = this.getContainerWidth();
        Renderer.drawRect(
            color, x + parent_x, y + parent_y, width, HEIGHT
        );
    }

    calculateWidth() {
        this.width = stringWidth(this.text);
        this.container_width = this.width;
        return this.width;
    }

    setContainerWidth(width = this.width) {
        this.container_width = width;
        return this;
    }

    setGap(gap) {
        this.gap = gap;
        return this;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    inArea(x, y) {
        return (x >= this.getContainerX() && x < this.getContainerX() + this.getContainerWidth() &&
                y >= this.getY() && y < this.getY() + HEIGHT);
    }
    getFocusElementAt(x, y) {
        return undefined;
    }

    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }

    getStartX() {
        return this.getX() + (this.align_x * this.container_width) - (this.align_x * this.width);
    }
    getEndX() {
        return this.getStartX() + this.width;
    }

    getContainerX() {
        return this.background_fill ? this.getX() : this.getStartX();
    }
    getContainerWidth() {
        return (this.background_fill ? this.container_width : this.width) - this.gap;
    }

    alignLeft() { this.align_x = 0.0; return this; }
    alignCenter() { this.align_x = 0.5; return this; }
    alignRight() { this.align_x = 1.0; return this; }
    setAlign(align) { this.align_x = align; return this; }

    setBackgroundFill(background_fill) { this.background_fill = background_fill; return this; }
    enableBackgroundFill() { this.background_fill = true; return this; }
    disableBackgroundFill() { this.background_fill = false; return this; }

    setBackgroundColor(background_color) { this.background_color = background_color; return this; }
}

export class Button extends Label {
    constructor(text, invoke_func = undefined) {
        super(text);
        this.invoke_func = invoke_func;
    }

    draw(mouse_x, mouse_y, parent_x = 0, parent_y = 0, highlight = false) {
        super.draw(mouse_x, mouse_y, parent_x, parent_y);
        if (this.invoke_func && this.inArea(mouse_x - parent_x, mouse_y - parent_y) || highlight) {
            this.drawBackground(parent_x, parent_y, Renderer.color(255, 255, 255, 64));
        }
    }

    clicked(mouse_x, mouse_y, mouse_button, parent_x = 0, parent_y = 0) {
        if (this.invoke_func && this.inArea(mouse_x - parent_x, mouse_y - parent_y)) {
            World.playSound("gui.button.press", 1.0, 1.0);
            this.invoke_func(mouse_x, mouse_y, mouse_button)
        }
    }

    
}

export class Row {
    constructor(...elements) {
        this.elements = elements;
        this.endline = true;

        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.gap = 0;
    }

    draw(mouse_x, mouse_y, parent_x, parent_y, highlight = false) {
        this.elements.forEach((element) => element.draw(mouse_x, mouse_y, parent_x, parent_y, highlight));
    }
    clicked(mouse_x, mouse_y, mouse_button, parent_x = 0, parent_y = 0) {
        this.elements.forEach((element) => element.clicked(mouse_x, mouse_y, mouse_button, parent_x, parent_y));
    }
    key(char, key) {
        this.elements.forEach((element) => element.key(char, key));
    }

    calculateWidth() {
        this.width = 0;
        this.elements.forEach((element) => {
            const element_width = element.calculateWidth() + 1;
            if (element_width > this.width)
                this.width = element_width;
        });
        this.width *= this.elements.length;
        return this.width;
    }

    setContainerWidth(width = this.width) {
        this.width = width;
        const element_width = width / this.elements.length;
        this.elements.forEach((element, idx) => {
            element.setContainerWidth(element_width);
            if (idx < this.elements.length - 1)
                element.setGap(this.gap);
            element.setPosition(this.x + (idx * element_width), this.y);
        });
        return this;
    }

    setGap(gap) {
        this.gap = gap;
        return this;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    inArea(x, y) {
        return (x >= this.getX() && x < this.getX() + this.width &&
                y >= this.getY() && y < this.getY() + HEIGHT);
    }
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }

    getFocusElementAt(x, y) {
        for (let element of this.elements) {
            let focused = element.getFocusElementAt(x, y);
            if (focused)
                return focused;
        }

        return undefined;
    }

}

export class Checkbox extends Button {
    constructor(text, invoke_func = () => {}, read_func = () => false) {
        super(`    ${text}`, invoke_func);
        this.padding = 0;
        text.match(/^\s*/).forEach((match) => {
            this.padding += match.length;
        });
        this.read_func = read_func;
        this.box_color = Renderer.color(255, 255, 255);
        this.check_color = Renderer.color(10, 10, 10)
    }

    draw(mouse_x, mouse_y, parent_x = 0, parent_y = 0) {
        super.draw(mouse_x, mouse_y, parent_x, parent_y);
        drawCheckbox(this.getStartX() + (this.padding * 3) + 1 + parent_x, this.getY() + parent_y, this.read_func(), this.box_color, this.check_color);
    }

    setCheckboxColor(box_color = Renderer.color(255, 255, 255), check_color = Renderer.color(10, 10, 10)) {
        this.box_color = box_color;
        this.check_color = check_color;
        return this;
    }
}

export class Textbox extends Button {
    constructor(text = "Text Field", invoke_func = (string) => {}) {
        super("", undefined);
        this.setBackgroundColor(Renderer.color(85, 85, 85, 127));
        this.endline = /.*\n$/.test(text);
        this.empty_text = text;
        this.input = "";
        this.invoke_func = () => { invoke_func(this.input) };
        this.refreshText();
    }

    clicked(mouse_x, mouse_y, mouse_button, parent_x = 0, parent_y = 0) {
        if (this.invoke_func && this.inArea(mouse_x - parent_x, mouse_y - parent_y)) {
            World.playSound("gui.button.press", 1.0, 1.0);
            // this.invoke_func(mouse_x, mouse_y, mouse_button)
        }
    }

    key(char, key) {
        if (key === 14) {
            if (this.input.length > 0) {
                this.input = this.input.slice(0, -1);
                this.refreshText();
            }
            return;
        }

    this.input = `${this.input}${char}`.replace(/[^\w\d /?,.<>!@#$%^&*()-_+=\[\]{}|\\;:'"`~*]/g, "");
        this.refreshText();
        return;
    }

    refreshText() {
        this.text = this.input.length > 0 ? `${this.input}\n` : `§7§o${this.empty_text}\n`
    }

    getFocusElementAt(x, y) {
        if (this.inArea(x, y))
            return this;

        return undefined;
    }
}

export class GuiMenu {
    constructor(x = 0, y = 0, content = [], min_width = 0) {
        this.x = x;
        this.y = y;
        this.min_width = min_width;
        this.width = 0;
        this.height = 0;
        this.anchor_x = 0.0;
        this.anchor_y = 0.0;
        this.align_x = 0.0;
        this.align_y = 0.0;
        this.focused = undefined;
        this.setContent(content);
    }

    draw(mouse_x, mouse_y) {
        Renderer.drawRect(Renderer.color(0, 0, 0, 127), this.getX() - 1, this.getY() - 1, this.width, this.height);
        this.content.forEach((element) => {
            element.draw(mouse_x, mouse_y, this.getX(), this.getY(), element === this.focused);
        })
    }

    clicked(mouse_x, mouse_y, mouse_button) {
        let last_focused = this.focused;
        this.focused = undefined;
        this.content.forEach((element) => {
            element.clicked(mouse_x, mouse_y, mouse_button, this.getX(), this.getY())
            this.focused = element.getFocusElementAt(mouse_x - this.getX(), mouse_y - this.getY()) ?? this.focused;
        });
        if (last_focused && last_focused !== this.focused)
            last_focused.invoke_func();
    }

    key(char, key) {
        if (!this.focused) return false;
        
        if (key === 28 || key === 1) {
            this.focused.invoke_func();
            this.focused = undefined;
            return true;
        }
        
        this.focused.key(char, key);
        this.setContent(this.content);
        return true;
    }

    addContent(content = []) {
        this.setContent([...this.content, ...content]);
    }

    changeContentText(idx, text) {
        if (idx < 0 || idx > content.length) return;
            this.content[idx].text = text; 

        this.setContent(this.content);
    }

    setContent(content = []) {
        this.content = content;
        let current_x = 0
        let current_y = 0;
        this.width = this.min_width;
        
        content.forEach((element, idx) => {
            element.setPosition(current_x, current_y);
            let current_width = element.calculateWidth(this.width);
            current_x += current_width;
            
            if (element.endline || idx == content.length - 1) {
                element.endline = true;
                if (this.width < current_x + 1)
                    this.width = current_x + 1;
                current_x = 0;
                current_y += 9;
            }
        })
        
        this.height = current_y;
        this.content.forEach((element) => {
            if (element.endline)
                element.setContainerWidth(this.width - element.x);
        })
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setMinWidth(min_width) {
        this.min_width = min_width;
        this.setContent(this.content);
    }

    getX() {
        return (Renderer.screen.width * this.anchor_x) + this.x - (this.align_x * this.width);
    }
    getY() {
        return (Renderer.screen.height * this.anchor_y) + this.y - (this.align_y * this.height);
    }

    inArea(x, y) {
        return (x >= this.getX() && x < this.getX() + this.width &&
                y >= this.getY() && y < this.getY() + this.height);
    }

    setAnchor(x, y) {
        this.anchor_x = x;
        this.anchor_y = y;
    }
    setAlign(x, y) {
        this.align_x = x;
        this.align_y = y;
    }
}

