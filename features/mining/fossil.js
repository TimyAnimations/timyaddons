import { requireContainer } from "../../utils/skyblock";
import Settings from "../../utils/settings/main";

const patterns = {
    TUSK: [
        [false, false,  true, false, false],
        [false,  true, false,  true, false],
        [ true, false, false, false,  true],
        [ true, false, false,  true, false],
        [ true, false, false, false, false],
    ],
    WEBBED: [
        [false, false,  true,  true,  true, false, false],
        [false,  true, false,  true, false,  true, false],
        [ true, false, false,  true, false, false,  true],
        [false, false, false,  true, false, false, false],
    ],
    CLUBBED: [
        [false, false, false,  true,  true,  true,  true, false],
        [false, false,  true, false, false, false, false,  true],
        [ true,  true, false, false, false, false,  true, false],
        [ true,  true, false, false, false, false, false, false],
    ],
    SPINE: [
        [false, false,  true,  true, false, false],
        [false,  true,  true,  true,  true, false],
        [ true,  true,  true,  true,  true,  true],
    ],
    CLAW: [
        [false, false, false, false,  true, false],
        [false, false,  true,  true,  true,  true],
        [false,  true, false,  true,  true, false],
        [ true, false,  true, false,  true, false],
        [false,  true, false,  true, false, false],
    ],
    FOOTPRINT: [
        [false, false, false,  true,  true],
        [false,  true,  true, false, false],
        [ true,  true,  true,  true,  true],
        [false,  true,  true, false, false],
        [false, false, false,  true,  true],
    ],
    HELIX: [
        [ true,  true,  true,  true],
        [ true, false, false,  true],
        [ true,  true, false,  true],
        [false, false, false,  true],
        [ true,  true,  true,  true],
    ],
    UGLY: [
        [false,  true,  true,  true,  true, false],
        [ true,  true,  true,  true,  true,  true],
        [false,  true,  true,  true,  true, false],
        [false, false,  true,  true, false, false],
    ]
}
const pattern_block_count = {
    TUSK: 8,
    WEBBED: 10,
    CLUBBED: 11,
    SPINE: 12,
    CLAW: 13,
    FOOTPRINT: 13,
    HELIX: 14,
    UGLY: 16
}

var current_patterns = undefined;
var current_state = [
    [-1, -1, -1, -1, -1, -1, -1, -1, -1], 
    [-1, -1, -1, -1, -1, -1, -1, -1, -1], 
    [-1, -1, -1, -1, -1, -1, -1, -1, -1], 
    [-1, -1, -1, -1, -1, -1, -1, -1, -1], 
    [-1, -1, -1, -1, -1, -1, -1, -1, -1], 
    [-1, -1, -1, -1, -1, -1, -1, -1, -1]
];
var valid_state = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0], 
    [0, 0, 0, 0, 0, 0, 0, 0, 0], 
    [0, 0, 0, 0, 0, 0, 0, 0, 0], 
    [0, 0, 0, 0, 0, 0, 0, 0, 0], 
    [0, 0, 0, 0, 0, 0, 0, 0, 0], 
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
];
var valid_min = 127;
var valid_max = 0;

var fossil_count = 0;
var dirt_count = 0;
var fossil_amount = 0;
requireContainer("Fossil Excavator", Settings.registerSetting("Fossil Excavator Solver", "tick", () => {
    let items = Player.getContainer().getItems();
    fossil_count = 0;
    dirt_count = 0;
    fossil_amount = 0;
    let first_fossil = -1;
    let last_fossil = -1;
    let current_percent = "";

    items.forEach((item, idx) => {
        if (idx >= 54) return;
        const [x, y] = [idx % 9, Math.floor(idx / 9)];
        current_state[y][x] = -1;
        if (item?.getID() === 160) {
            if (item?.getDamage() === 0) {
                current_state[y][x] = 1;
                if (first_fossil === -1)
                    first_fossil = idx;
                last_fossil = idx;
                fossil_count++;
                const fossil_data = item?.getNBT()?.toObject();
                fossil_data?.tag?.display?.Lore?.forEach((line, idx) => {
                    if (!/§7Fossil Excavation Progress: §[c6ea][\d\.]*%/g.test(line)) return;
                    current_percent = line.split(/§[c6ea]/g).slice(-1)[0].replace("%", "");
                });
            }
            else if (item?.getDamage() === 12) {
                current_state[y][x] = 0;
                dirt_count++;
            }
        }
        // dirt is 160 12
        // fossil is 160 0
    });
    
    let possible_patterns = [];
    if (current_percent !== "") {
        Object.entries(pattern_block_count).forEach(([pattern, amount]) => {
            const percent = (fossil_count * 100 / amount);
            if (   percent.toFixed(1) === current_percent 
                || (percent - 0.05).toFixed(1) === current_percent 
                || (percent + 0.05).toFixed(1) === current_percent 
                || percent.toFixed() === current_percent
            ) {
                fossil_amount = amount;
                possible_patterns.push(pattern);
            }
        });
    }

    current_patterns = [];
    possible_patterns.forEach((pattern) => {
        current_patterns.push(...generatePatternVarients(patterns[pattern]));
    })
    valid_state = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
    valid_min = 127;
    valid_max = 0;
    current_patterns.forEach((pattern) => validatePattern(
        pattern, 
        first_fossil !== -1 ? first_fossil :undefined,
        last_fossil !== -1 ? last_fossil : undefined,
    ));
}));

function drawPattern(pattern, x = 0, y = 0, color = Renderer.color(255, 255, 255, 127)) {
    if (!pattern) return;
    const width = pattern.length;
    const height = pattern[0].length;
    if (x + width >= 9)
        x = 9 - width;
    if (y + height >= 6)
        y = 6 - width;
    
    const [anchor_x, anchor_y] = [(Renderer.screen.getWidth() / 2) - 81, (Renderer.screen.getHeight() / 2) - 94];
    pattern.forEach((row, y_idx) => {
        row.forEach((value, x_idx) => {
            if (!value) return;
            Renderer.drawRect(color, anchor_x + ((x + x_idx) * 18), anchor_y + ((y + y_idx) * 18), 18, 18);
        })
    })
}

function mirrorPattern(pattern) {
    return pattern.map((row) => row.map((_, idx) => row[row.length - 1 - idx]));
}

function transposePattern(pattern) {
    return pattern[0].map((_, idx) => pattern.map(row => row[idx]));
}

function reversePattern(pattern) {
    return pattern.map((_, idx) => pattern[pattern.length - 1 - idx].map((col) => col));
}

function generatePatternVarients(pattern) {
    return [
        pattern,
        mirrorPattern(transposePattern(pattern)), // +90
        reversePattern(mirrorPattern(pattern)), // +180,
        transposePattern(mirrorPattern(pattern)), // -90
        mirrorPattern(pattern), // mirror
        mirrorPattern(reversePattern(transposePattern(pattern))), // mirror +90
        reversePattern(pattern), // mirror +180
        transposePattern(pattern), // mirror -90
    ]
}

function validatePattern(pattern, low = 0, high = 53) {
    const end_y = Math.floor(high / 9) + 1;
    const end_x = (high % 9) + 1;

    const width = pattern[0].length;
    const height = pattern.length;
    
    let start_x = (low % 9) - width;
    if (start_x < 0) start_x = 0;
    let start_y = Math.floor(low / 9) - height;
    if (start_y < 0) start_y = 0;
    
    if (width > 9 || height > 6) {
        return;
    }
    
    for (let y = start_y; y < end_y && y + height - 1 < 6; y++)
    for (let x = start_x; x < end_x && x + width - 1 < 9; x++) {
        let valid = isPatternValidAt(pattern, x, y);
        if (valid) {
            pattern.forEach((row, y_idx) => {
                row.forEach((value, x_idx) => {
                    if (value && current_state[y + y_idx][x + x_idx] === 0)
                        valid_state[y + y_idx][x + x_idx] += 1;
                })
            });
        }
    }

    valid_state.forEach((row, y_idx) => {
        row.forEach((value, x_idx) => {
            if (value === 0) return;
            if (value < valid_min)
                valid_min = value;
            if (value > valid_max)
                valid_max = value;
        });
    });
}

function isPatternValidAt(pattern, x, y) {
    let valid = true;
    let count = 0;
    pattern.forEach((row, y_idx) => {
        row.forEach((value, x_idx) => {
            if (value) {
                if (current_state[y + y_idx][x + x_idx] === 1)
                    count++;
                if (current_state[y + y_idx][x + x_idx] === -1)
                    valid = false;
            }
            else {
                if (current_state[y + y_idx][x + x_idx] === 1)
                    valid = false;
            }
        });
    });
    return valid && count === fossil_count;
}

function highlightSlot(idx, color = Renderer.WHITE, frame = undefined) {
    const [anchor_x, anchor_y] = [(Renderer.screen.getWidth() / 2) - 81, (Renderer.screen.getHeight() / 2) - 94];
    const [idx_x, idx_y] = [idx % 9, Math.floor(idx / 9)];
    const [x, y] = [anchor_x + (idx_x * 18), anchor_y + (idx_y * 18)];

    Renderer.drawRect(color, x, y, 18, 18);
    if (frame) {
        GL11.glLineWidth(2);
        Renderer.drawShape(frame, [
            [x, y],
            [x, y + 18],
            [x + 18, y + 18],
            [x + 18, y],
        ], 2);
    }
}

requireContainer("Fossil Excavator", Settings.registerSetting("Fossil Excavator Solver", "guiRender", () => {
    if (dirt_count <= 0) return;
    const [center_x, center_y] = [(Renderer.screen.getWidth() / 2), (Renderer.screen.getHeight() / 2)];
    if (fossil_count > 0)
        Renderer.drawString(`&6Fossil Progress: &r${fossil_count}/${fossil_amount}`, center_x - 84, center_y - 121);
    valid_state.forEach((row, y_idx) => {
        row.forEach((value, x_idx) => {
            if (value === 0) return;
            highlightSlot(
                y_idx * 9 + x_idx, 
                Renderer.color(
                    127, 
                    127 + ((value + 1 - valid_min) * 127 / (valid_max + 1 - valid_min)), 
                    127, 
                    85 + ((value + 1 - valid_min) * 127 / (valid_max + 1 - valid_min))
                ),
                value === valid_max ? Renderer.AQUA : undefined
            );
        });
    });
}));