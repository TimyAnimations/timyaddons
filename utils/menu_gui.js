import { getEndTextColor, stringWidth } from "./format";
import { drawCheckbox } from "./render";

const HEIGHT = 9;
export class Label {
    constructor(text) {
        this.text = text;
        this.align_x = 0.0;
        this.background_color = undefined;
        this.frame_color = undefined;
        this.frame_thickness = 1;
        
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = HEIGHT;
        this.container_width = 0;
        this.background_fill = true;

        this.gap = 0;

        this.endline = /.*\n$/.test(text);
    }

    draw(mouse_x, mouse_y, parent_x = 0, parent_y = 0, highlight = false, focused = false) {
        this.drawBackground(parent_x, parent_y, this.background_color);
        this.drawFrame(parent_x, parent_y, this.frame_thickness, this.frame_color);
        Renderer.drawString(this.text, parent_x + this.getStartX(), parent_y + this.getY() + ((this.height - 9) / 2));
    }

    clicked() {}
    key() {}

    drawBackground(parent_x, parent_y, color = undefined) {
        if (!color) return;
        const x = this.getContainerX() - 1;
        const y = this.getY() - 1;
        const width = this.getContainerWidth();
        Renderer.drawRect(
            color, x + parent_x, y + parent_y, width, this.height
        );
    }
    
    drawFrame(parent_x, parent_y, thickness = Renderer.screen.getScale(), color = undefined) {
        if (!color) return;
        const x = this.getContainerX() - 1;
        const y = this.getY() - 1;
        const width = this.getContainerWidth();

        GL11.glLineWidth(thickness);
        
        Renderer.drawShape(color, [
            [x + parent_x, y + parent_y],
            [x + parent_x, y + parent_y + this.height],
            [x + parent_x + width, y + parent_y + this.height],
            [x + parent_x + width, y + parent_y],
        ], 2);
    }

    calculateWidth() {
        this.width = stringWidth(this.text) + this.gap;
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

    setHeight(height) {
        this.height = height;
        return this;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    inArea(x, y) {
        return (x >= this.getContainerX() && x < this.getContainerX() + this.getContainerWidth() &&
                y >= this.getY() && y < this.getY() + this.height);
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

    setBackgroundColor(color) { this.background_color = color; return this; }
    setFrameColor(color) { this.frame_color = color; return this; }
    setFrameThickness(thickness) { this.frame_thickness = thickness; return this; }

    hasElement(element) {
        return this === element;
    }
}

export class Button extends Label {
    constructor(text, invoke_func = undefined) {
        super(text);
        this.invoke_func = invoke_func;
    }

    draw(mouse_x, mouse_y, parent_x = 0, parent_y = 0, highlight = false, focused = false) {
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

export class Line extends Label {
    constructor(height, color = undefined) {
        super("\n");
        this.height = height;
        this.setBackgroundColor(color);
    }
}

export class Row {
    constructor(...elements) {
        this.elements = elements;
        this.endline = true;

        this.focused = undefined;

        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.gap = 0;
        this.height = HEIGHT;
        this.setHeight(HEIGHT);
    }

    draw(mouse_x, mouse_y, parent_x, parent_y, highlight = false, focused = false) {
        this.elements.forEach((element) => {
            element.draw(mouse_x, mouse_y, parent_x, parent_y, highlight && element.hasElement(this.focused), focused && element.hasElement(this.focused));
        });
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

    setHeight(height) {
        this.height = height;
        this.elements.forEach((element) => { element.setHeight(height); });
        return this;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    inArea(x, y) {
        return (x >= this.getX() && x < this.getX() + this.width &&
                y >= this.getY() && y < this.getY() + this.height);
    }
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }

    getFocusElementAt(x, y) {
        this.focused = undefined;
        for (let element of this.elements) {
            this.focused = element.getFocusElementAt(x, y);
            if (this.focused)
                return this.focused;
        }

        return undefined;
    }

    hasElement(element) {
        return this === element || this.elements.reduce((prev, child) => { return prev || child.hasElement(element); })
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

    draw(mouse_x, mouse_y, parent_x = 0, parent_y = 0, highlight = false, focused = false) {
        super.draw(mouse_x, mouse_y, parent_x, parent_y, highlight, focused);
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
        this.setFrameColor(Renderer.color(0, 0, 0, 85));
        this.setFrameThickness(2);
        this.endline = /.*\n$/.test(text);
        this.empty_text = text;
        this.input = "";
        this.cursor = 0;
        this.cursor_x = 0;
        this.cursor_color = Renderer.WHITE;
        this.left_cursor = 0;
        this.right_cursor = 0;
        this.highlight_x = 0;
        this.highlight_width = 0;
        this.invoke_func = () => { invoke_func(this.input) };
        this.refreshText();
    }

    draw(mouse_x, mouse_y, parent_x = 0, parent_y = 0, highlight = false, focused = false) {
        super.draw(mouse_x, mouse_y, parent_x, parent_y, highlight, focused);
        if (focused) {
            this.drawFrame(parent_x, parent_y, Renderer.screen.getScale(), Renderer.GRAY);
            if (this.highlight_width > 0) {
                Renderer.drawRect(Renderer.color(85, 85, 255, 127), this.getStartX() + parent_x + this.highlight_x, parent_y + this.getY() + ((this.height - 9) / 2) - 0.5, this.highlight_width, 8);
            }
            if (Math.floor(Date.now() / 530) % 2 == 0)
                Renderer.drawLine(
                    this.cursor_color, 
                    this.getStartX() + parent_x + this.cursor_x + 1, parent_y + this.getY() + ((this.height - 9) / 2) - 0.75,
                    this.getStartX() + parent_x + this.cursor_x + 1, parent_y + this.getY() + ((this.height - 9) / 2) + 7.75,
                    1.5
                );
            
            Renderer.drawString(this.text, parent_x + this.getStartX(), parent_y + this.getY() + ((this.height - 9) / 2));
            
            // Renderer.drawString(`${this.left_cursor}|${this.right_cursor}, x, ${this.highlight_x} w, ${this.highlight_width}`, mouse_x + 3, mouse_y - 3);
        }
    }

    clicked(mouse_x, mouse_y, mouse_button, parent_x = 0, parent_y = 0) {
        if (this.invoke_func && this.inArea(mouse_x - parent_x, mouse_y - parent_y)) {
            World.playSound("gui.button.press", 1.0, 1.0);
            // this.invoke_func(mouse_x, mouse_y, mouse_button)
        }
    }

    key(char, key) {
        switch (key) {
            case 14: // backspace
                if (this.left_cursor === this.right_cursor && this.left_cursor !== 0)
                    this.left_cursor--;
                break;
            case 211: // delete
                if (this.left_cursor === this.right_cursor && this.right_cursor !== this.input.length)
                    this.right_cursor++;
                break;
            case 205: // right
                if (this.left_cursor === this.right_cursor || Client.isShiftDown())
                    this.cursor++
                if (Client.isShiftDown()) {
                    if (this.right_cursor + 1 === this.cursor)
                        this.right_cursor = this.cursor;
                    else if (this.left_cursor + 1 === this.cursor)
                        this.left_cursor = this.cursor;
                }
                else {
                    this.left_cursor = this.cursor;
                    this.right_cursor = this.cursor;
                }

                this.updateCursor();    
                return; 
            case 203: // left
                if (this.left_cursor === this.right_cursor || Client.isShiftDown())
                    this.cursor--
                if (Client.isShiftDown()) {
                    if (this.left_cursor - 1 === this.cursor)
                        this.left_cursor = this.cursor;
                    else if (this.right_cursor - 1 === this.cursor)
                        this.right_cursor = this.cursor;
                }
                else {
                    this.left_cursor = this.cursor;
                    this.right_cursor = this.cursor;
                }

                this.updateCursor();    
                return;
            case 30: // a
                if (Client.isControlDown()) {
                    this.left_cursor = 0;
                    this.right_cursor = this.input.length;
                    this.cursor = this.input.length;
                    this.updateCursor();
                    return
                }
                break;
        }
        // ChatLib.chat(key);

        let new_input = `${char}`.replace(/[^\w\d /?,.<>!@#$%^&*()-_+=\[\]{}|\\;:'"`~*]/g, "");
        if (new_input === "" && key !== 14 && key !== 211)
            return;

        let left_input = `${this.input.slice(0, this.left_cursor)}${new_input}`;
        let right_input = this.input.slice(this.right_cursor, this.input.length);
        this.setInput(`${left_input}${right_input}`, left_input.length);
        return;
    }

    updateCursor(position = undefined) {
        if (position !== undefined) {
            this.cursor = position;
            this.left_cursor = position;
            this.right_cursor = position;
        }

        if (this.cursor > this.input.length)
            this.cursor = this.input.length;
        if (this.left_cursor > this.input.length)
            this.left_cursor = this.input.length;
        if (this.right_cursor > this.input.length)
            this.right_cursor = this.input.length;
        if (this.cursor < 0)
            this.cursor = 0;
        if (this.left_cursor < 0)
            this.left_cursor = 0;
        if (this.right_cursor < 0)
            this.right_cursor = 0;

        if (this.right_cursor < this.left_cursor)
            this.right_cursor = this.left_cursor;

        this.highlight_x = stringWidth(this.input.slice(0, this.left_cursor));
        this.highlight_width = stringWidth(this.input.slice(this.left_cursor, this.right_cursor));
        
        this.cursor_color = getEndTextColor(this.input.slice(0, this.cursor));
        let cursor_string = 
            /&[0-9a-fk-or]/.test(this.input.slice(this.cursor - 1, this.cursor + 1)) 
                ? this.input.slice(0, this.cursor + 1)
                : this.input.slice(0, this.cursor);
        this.cursor_x = stringWidth(cursor_string);
    }

    setInput(input, cursor_position = undefined) {
        this.input = input;
        this.refreshText();
        this.updateCursor(cursor_position);
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
        this.background_color = Renderer.color(0, 0, 0, 127);
        this.setContent(content);
    }

    draw(mouse_x, mouse_y) {
        Renderer.drawRect(this.background_color, this.getX() - 1, this.getY() - 1, this.width, this.height);
        this.content.forEach((element) => {
            element.draw(mouse_x, mouse_y, this.getX(), this.getY(), element.hasElement(this.focused), element.hasElement(this.focused));
        })
    }

    clicked(mouse_x, mouse_y, mouse_button) {
        let last_focused = this.focused;
        this.focused = undefined;
        this.content.forEach((element) => {
            this.focused = element.getFocusElementAt(mouse_x - this.getX(), mouse_y - this.getY()) ?? this.focused;
        });
        if (last_focused && last_focused !== this.focused)
            last_focused.invoke_func();
        this.content.forEach((element) => {
            element.clicked(mouse_x, mouse_y, mouse_button, this.getX(), this.getY())
        });
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
        
        let current_height = 0;
        content.forEach((element, idx) => {
            element.setPosition(current_x, current_y);
            let current_width = element.calculateWidth(this.width);
            current_x += current_width;

            if (current_height < element.height)
                current_height = element.height;
            
            if (element.endline || idx == content.length - 1) {
                element.endline = true;
                if (this.width < current_x + 1)
                    this.width = current_x + 1;
                current_x = 0;
                current_y += current_height;
                current_height = 0;
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

    setBackgroundColor(color) {
        this.background_color = color;
        return this;
    }
}

