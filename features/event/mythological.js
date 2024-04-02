import Settings from "../../utils/settings/main";
import WaypointColorSettings from "../../utils/settings/mythological_waypoint_colors";
import DeveloperSettings from "../../utils/settings/developer";
import { queueCommand } from "../../utils/command_queue";
import { drawWaypoint, Waypoint } from "../../utils/waypoint";
import { getGrassCoord, getGrassCoordAlongRay, getGrassHeight, saveGrassHeightMap, setGrassHeight } from "../../constant/hub_grass_heightmap";
import { getNearEntitiesOfType } from "../../utils/entities";
import { drawOffscreenPointer, drawOutlinedBox, drawOutlinedPlane, drawWorldString } from "../../utils/render";
import { createKeyBind } from "../../utils/keybinds";
import { isHoldingSkyblockItem } from "../../utils/skyblock";

var arrow_position = undefined;
var arrow_orientations = [];

const arrow_subdegrees = 1;

var arrow_color = undefined;
var arrow_distance_range = {min: 0, max: 500};
const ARROW_RANGE_COLORS = {
    "RED": {min: 280, max: 500},
    "YELLOW": {min: 110, max: 290},
    "ORANGE": {min: 0, max: 120},
}

var spade_player_position = undefined;
var spade_positions = [];
var spade_orientation = undefined;
var spade_end_segment = undefined;
var spade_on_cooldown = false;
var spade_last_position = undefined;
var spade_last_orientation = undefined;
var spade_dot_product = -1.0;

var spade_pitch_distance = undefined;
var spade_pitch_position = undefined;
var spade_pitch_count = 0;

var burrows = {};
var recently_removed_burrows = [];

var last_hit_grass_position = undefined;

function resetState() {
    arrow_position = undefined;
    arrow_orientations = [];
    arrow_color = undefined;
    arrow_distance_range = {min: 0, max: 500};
    guess_position = undefined;
    guess_waypoint.hide()
    spade_player_position = undefined;
    spade_last_position = undefined;
    spade_last_orientation = undefined;
    spade_positions = [];
    spade_orientation = undefined;
    spade_pitch_distance = undefined;
    spade_pitch_position = undefined;
    spade_dot_product = -1.0;

    last_hit_grass_position = undefined;

    spade_pitch_count = 0;

    guess_positions = [];
    guess_key = undefined;

    guess_waypoint.hide();
}

const AVERAGE_DISTANCE = {
    "RED": 300,
    "YELLOW": 200,
    "ORANGE": 60,
}

var guess_positions = [];
var guess_position = undefined;
var guess_warp = undefined;
var guess_key = undefined;

var guess_waypoint = new Waypoint(
    "Guess", 0, 0, 0, 
    WaypointColorSettings.color_guess.getRed() / 255,
    WaypointColorSettings.color_guess.getGreen() / 255,
    WaypointColorSettings.color_guess.getBlue() / 255,
    false
);
guess_waypoint.makeMovementSmooth();
guess_waypoint.acceleration = ((1 - Settings.mythological_next_burrow_guess_smoothness) * 0.75) + 0.25;
guess_waypoint.damp = guess_waypoint.acceleration;
const GUESS_ALIGN_DISTANCE = 5;

Settings.addAction("Next Burrow Guess Smoothness", (value) => {
    guess_waypoint.acceleration = ((1 - value) * 0.75) + 0.25;
    guess_waypoint.damp = guess_waypoint.acceleration;
});

const HUB_WARPS = {
    "hub": {x: -2.5, y: 70, z: -69.5, exit_distance: 0},
    "castle": {x: -250, y: 130, z: 45, exit_distance: 0},
    "da": {x: 91.5, y: 75, z: 173.5, exit_distance: 5},
    "museum": {x: -75.5, y: 76, z: 80.5, exit_distance: 0},
    "crypt": {x: -189.5, y: 74, z: -86.5, exit_distance: 75},
    "wizard": {x: 51.5, y: 122, z: 72.5, exit_distance: 15}
}
const HUB_WARPS_TRUE_COORDINATES = {
    "hub": {x: -2.5, y: 70, z: -69.5},
    "castle": {x: -250, y: 130, z: 45},
    "da": {x: 91.5, y: 75, z: 173.5},
    "museum": {x: -75.5, y: 76, z: 80.5},
    "crypt": {x: -161.5, y: 61, z: -99.5},
    "wizard": {x: 42.5, y: 122, z: 69}
}
const HUB_SETTINGS = {
    "hub": () => Settings.mythological_warp_hub,
    "castle": () => Settings.mythological_warp_castle,
    "da": () => Settings.mythological_warp_da,
    "museum": () => Settings.mythological_warp_museum,
    "crypt": () => Settings.mythological_warp_crypt,
    "wizard": () => Settings.mythological_warp_wizard
}

function setGuess(position) {
    if (!position) return;
    guess_position = position;
    guess_waypoint.show();
    guess_waypoint.setPosition(position.x, position.y, position.z);
    guess_key = `${Math.floor(position.x)},${Math.floor(position.z)}`;

    if (!Settings.mythological_warp) return;
    let closest_warp = undefined;
    let closest_distance_sq = ( (Player.getX() - position.x)**2 + (Player.getY() - position.y)**2 + (Player.getZ() - position.z)**2 ) * 0.5625;
    for (let location in HUB_WARPS) {
        if (!(location in HUB_SETTINGS) || !HUB_SETTINGS[location]()) continue;
        let warp_distance_sq =   (HUB_WARPS[location].x - position.x)**2 + (HUB_WARPS[location].y - position.y)**2 
                               + (HUB_WARPS[location].z - position.z)**2 + (HUB_WARPS[location].exit_distance)**2 + 250;
        if (warp_distance_sq < closest_distance_sq) {
            closest_warp = location;
            closest_distance_sq = warp_distance_sq;
        }
    }
    guess_warp = closest_warp;
    
    if (guess_key in burrows && (burrows[guess_key].max_count >= PARTICLE_SHOW_COUNT || burrows[guess_key].position_confirmed)) {
        guess_waypoint.name = `${burrows[guess_key].type}\nGuess`
        guess_waypoint.setColor(
            burrows[guess_key].color.r,
            burrows[guess_key].color.g,
            burrows[guess_key].color.b
        );
    }
    else {
        guess_waypoint.name = "Guess"
        guess_waypoint.setColor(
            guess_color.r,
            guess_color.g,
            guess_color.b
        );
    }
    if (guess_warp)
        guess_waypoint.name += `\n§7${guess_warp}`;
}

function intersectPoint(a_pos, a_dir, b_pos, b_dir, t_min = 0, t_max = Infinity, backup_y = undefined) {
    if (!a_pos || !a_dir || !b_pos || !b_dir) return undefined;
    
    let dx = b_pos.x - a_pos.x;
    let dz = b_pos.z - a_pos.z;
    let det = b_dir.x * a_dir.z - b_dir.z * a_dir.x;
    
    if (det == 0) return undefined;
    
    let t = (dz * b_dir.x - dx * b_dir.z) / det;
    if (t < t_min || t > t_max) return undefined;
    
    let t2 = (dz * a_dir.x - dx * a_dir.z) / det;
    if (t2 < 0) return undefined;

    return getGrassCoord(a_pos.x + a_dir.x * t, a_pos.z + a_dir.z * t, backup_y);
}

var spade_particle_trigger = register("spawnParticle", (particle, type) => {
    if (type.toString() !== "FIREWORKS_SPARK") return;
    if (!spade_player_position) return;

    const particle_position = {x: particle.getX(), y: particle.getY(), z: particle.getZ()};
    const last_position = spade_positions.length > 0 ? spade_positions[spade_positions.length - 1] : spade_player_position;
    const firework_distance_sq = (particle_position.x - last_position.x)**2 + (particle_position.y - last_position.y)**2 + (particle_position.z - last_position.z)**2;
    
    if (firework_distance_sq > 16) return;

    const old_spade_orientation = spade_orientation;
    const diff = {x: particle_position.x - last_position.x, y: particle_position.y - last_position.y, z: particle_position.z - last_position.z};
    const length = Math.sqrt((diff.x * diff.x) + (diff.y * diff.y) + (diff.z * diff.z))
    if (length == 0) return;
    const current_spade_orientation = {x: diff.x / length, y: diff.y / length, z: diff.z / length};

    if (old_spade_orientation) {
        const dot_product =  (current_spade_orientation.x * old_spade_orientation.x) 
                           + (current_spade_orientation.y * old_spade_orientation.y) 
                           + (current_spade_orientation.z * old_spade_orientation.z);
        if (spade_pitch_count > 4 && dot_product < spade_dot_product * 0.95) return;
        spade_dot_product = dot_product;
    }

    spade_positions.push({x: particle_position.x, y: particle_position.y, z: particle_position.z});
    spade_orientation = current_spade_orientation;
    
    spade_end_segment = {
        x: spade_orientation.x * 500, 
        y: spade_orientation.y * 500, 
        z: spade_orientation.z * 500
    };

    // look for a grass block that the spade particles are heading towards
    // only consider this if the particles are heading significantly downwards
    let collides_grass_position = undefined;
    if (spade_orientation.y < -0.6) for (let i = 71; i < 100; i++) {
        if (i > particle_position.y) continue;
        
        let particle_height = particle_position.y - i;
        let length = -particle_height / spade_orientation.y;
        if (length > 500) continue;

        let end_segment = {
            x: spade_orientation.x * length, 
            y: spade_orientation.y * length, 
            z: spade_orientation.z * length
        };

        let grass_block_position = {
            x: Math.floor( particle_position.x + end_segment.x ), 
            y: Math.floor( particle_position.y + end_segment.y - 1 ), 
            z: Math.floor( particle_position.z + end_segment.z )
        };

        if (grass_block_position.y === getGrassHeight(grass_block_position.x, grass_block_position.z)) {
            collides_grass_position = grass_block_position;
            spade_end_segment = end_segment;
        }
    }
    const current_pitch_distance = spade_pitch_distance && spade_pitch_position 
        ? spade_pitch_distance - Math.sqrt(  (particle_position.x - spade_pitch_position.x)**2 
                                           + (particle_position.y - spade_pitch_position.y)**2 
                                           + (particle_position.z - spade_pitch_position.z)**2 )
        : undefined;

    // array of individual guesses
    guess_positions = [
        // current ray intersecting arrow rays
        ...arrow_orientations.map((orientation) => 
            intersectPoint(arrow_position, orientation, last_position, spade_orientation, arrow_distance_range.min, arrow_distance_range.max, arrow_position.y)
        ),
        // current ray intersecting previous ray
        intersectPoint(spade_last_position, spade_last_orientation, last_position, spade_orientation, 0, 500),
        // current ray intersecting grass heightmap
        collides_grass_position,
        // distance along current ray predicted with pitch from the noise
        current_pitch_distance && old_spade_orientation ? getGrassCoordAlongRay(
            last_position.x + old_spade_orientation.x * current_pitch_distance,
            last_position.z + old_spade_orientation.z * current_pitch_distance,
            old_spade_orientation.x, old_spade_orientation.z
        ) : undefined
    ];

    // check if any individual guesses land on a found burrow, if so set this as the guess
    for (let pos of guess_positions) {
        if (!pos) continue;
        if (`${Math.floor(pos.x)},${Math.floor(pos.z)}` in burrows && burrows[`${Math.floor(pos.x)},${Math.floor(pos.z)}`].position_confirmed) {
            setGuess(pos);
            spade_particle_trigger.unregister();
            return;
        }
    }

    // find the average position between all the guesses
    const guess_positions_sum = 
        guess_positions.reduce((acc, pos) => {
            if (!pos) return acc;
            if (!acc.pos) return { pos: pos, count: 1 };
            return { 
                pos: {
                    x: acc.pos.x + pos.x,
                    y: acc.pos.y + pos.y,
                    z: acc.pos.z + pos.z,
                }, 
                count: acc.count + 1 
            };
        }, { pos: undefined, count: 0 });
    
    // no guesses where made, return
    if (!guess_positions_sum || !guess_positions_sum.pos || guess_positions_sum.count <= 0)
        return;

    let guess_positions_average = {
        x: guess_positions_sum.pos.x / guess_positions_sum.count, 
        z: guess_positions_sum.pos.z / guess_positions_sum.count, 
        y: guess_positions_sum.pos.y / guess_positions_sum.count
    }

    // if a found burrow is nearby, set this as the guess
    const closest = closestBurrow(GUESS_ALIGN_DISTANCE, guess_positions_average.x, guess_positions_average.z);
    if (closest) {
        setGuess(closest.position);
        spade_particle_trigger.unregister();
        return;
    }

    // find the closest grass block to the guess position
    // look along current ray
    let closest_guess_position = 
        getGrassCoordAlongRay(
            guess_positions_average.x, 
            guess_positions_average.z, 
            spade_orientation.x, spade_orientation.z 
        ) 
        ?? getGrassCoord(
            guess_positions_average.x, 
            guess_positions_average.z, 
            guess_positions_average.y
        );
    let guess_position_distance_sq = (closest_guess_position.x -guess_positions_average.x)**2 + (closest_guess_position.z -guess_positions_average.z)**2;
    
    // look along previous ray
    if (old_spade_orientation) {
        let position = getGrassCoordAlongRay(
            guess_positions_average.x, 
            guess_positions_average.z, 
            old_spade_orientation.x, old_spade_orientation.z
        )
        let distance_sq = (closest_guess_position.x -guess_positions_average.x)**2 + (closest_guess_position.z -guess_positions_average.z)**2;
        if (distance_sq < guess_position_distance_sq) {
            guess_position_distance_sq = distance_sq;
            closest_guess_position = position;
        }
    }
    
    // look along arrow rays
    arrow_orientations.forEach((arrow_orientation) => {
        let position = getGrassCoordAlongRay(
            guess_positions_average.x, 
            guess_positions_average.z, 
            arrow_orientation.x, arrow_orientation.z
        )
        let distance_sq = (closest_guess_position.x -guess_positions_average.x)**2 + (closest_guess_position.z -guess_positions_average.z)**2;
        if (distance_sq < guess_position_distance_sq) {
            guess_position_distance_sq = distance_sq;
            closest_guess_position = position;
        }
    });

    guess_position = closest_guess_position;
    setGuess(guess_position);
});
spade_particle_trigger.unregister();

// big maths
const SPADE_PITCH_COEFFICIENTS = [
    [63_516.4706,  11.01958824],
    [2.445664759, -6.652392175],
    [9.944610101, -4.802423233],
    [16.25333429, -4.301655148],
    [20.66598847, -4.226321311],
    [24.42687588, -4.239267522],
    [28.53085843, -4.196922033], 
    [29.9235914,  -4.510083232],
    [33.53995086, -4.549163226],
    [37.77119495, -4.535379304],
    [42.89715179, -4.352931832],
    [47.23358309, -4.468650065],
    [50.19107216, -4.425997071],
    [56.9087921,  -4.374809938],
    [59.02544922, -4.512568686],  
    [64.82047072, -4.339042811],
    [70.95358555, -4.18756102 ],  
    [77.45171084, -4.056797543],
    [74.53644179, -4.610065449],
    [78.69363793, -4.680825028],
    [81.44162369, -4.851740855],
    [84.374116,   -4.953827561],
    [90.79173407, -4.849241755],
    [112.6355305, -3.694735443], 
    [106.8894407, -4.253159979], 
    [112.9599021, -4.161871314], 
    [116.881564,  -4.225700012], 
    [123.4626039, -4.192282502], 
    [128.6494095, -4.091884419]
];

spade_sound_trigger = register("soundPlay", (pos, name, vol, pitch, category) => {
    if (spade_pitch_count >= SPADE_PITCH_COEFFICIENTS.length) return;
    spade_pitch_distance =   SPADE_PITCH_COEFFICIENTS[spade_pitch_count][0] 
                           * Math.pow(pitch, SPADE_PITCH_COEFFICIENTS[spade_pitch_count][1]);
    spade_pitch_position = {x: pos.x, y: pos.y, z: pos.z};
    spade_pitch_count++;
}).setCriteria("note.harp");
spade_sound_trigger.unregister();

var arrow_particle_trigger = register("spawnParticle", (particle, type) => {
    if (type.toString() !== "REDSTONE") return;
    if (!arrow_position || arrow_color) return;
    
    const particle_position = {x: particle.getX(), y: particle.getY(), z: particle.getZ()};

    const arrow_distance_sq = (particle_position.x - arrow_position.x)**2 + (particle_position.y - arrow_position.y)**2 + (particle_position.z - arrow_position.z)**2;
    if (arrow_distance_sq > 9) return;
    
    const color = particle.getColor();
    if (!color) return;
    
    // if it has blue or a low amount of red, probably a rune or pet particle
    if (color.getBlue() !== 0 || color.getRed() < 100) return;

    if (color.getGreen() === 0) arrow_color = "RED";
    else if (color.getGreen() / color.getRed() > 0.7) 
         arrow_color = "YELLOW";
    else arrow_color = "ORANGE";
    
    let block_position = {x: Math.floor(particle_position.x), y: Math.floor(particle_position.y), z: Math.floor(particle_position.z)}
    let key = `${block_position.x},${block_position.z}`;
    
    let on_grass = false;
    for (let i = 0; !on_grass && i < 3; i++) {
        let block = World.getBlockAt(block_position.x, block_position.y, block_position.z);
        if (block?.type?.getID() !== 2) {
            block_position.y -= 1;
        }
        else on_grass = true;
    }
    if (on_grass && key in burrows)
        removeBurrow(key);

    guess_position = getGrassCoordAlongRay(
        arrow_position.x + arrow_orientations[0].x * AVERAGE_DISTANCE[arrow_color],
        arrow_position.z + arrow_orientations[0].z * AVERAGE_DISTANCE[arrow_color],
        arrow_orientations[0].x, arrow_orientations[0].z
    );
    
    setGuess(guess_position);

    arrow_distance_range = ARROW_RANGE_COLORS[arrow_color];

    arrow_particle_trigger.unregister();
});
arrow_particle_trigger.unregister();

function findArrowOrientation(block_position) {
    let armor_stands = getNearEntitiesOfType(
        block_position.x, block_position.y, block_position.z,
        Java.type("net.minecraft.entity.item.EntityArmorStand")
    );
    
    let arrow = undefined;
    for (let i = 0; i < armor_stands.length && !arrow; i++) {
        if (armor_stands[i].getPos().distanceSq(block_position) > 9) continue;
        if (armor_stands[i].entity?.func_71124_b(0)?.func_77977_a() !== "item.arrow") continue;
        arrow = armor_stands[i];
    }
    
    if (!arrow) return;
    let key = `${Math.floor(block_position.x)},${Math.floor(block_position.z)}`;
    if (key in burrows) removeBurrow(key);

    const angle_deg = arrow.getYaw() + 0.5;
    let angles = [];
    angles.push(angle_deg * Math.PI / 180.0);
    
    const degree_inc = 0.25 / arrow_subdegrees;
    for (let i = 1; i <= arrow_subdegrees; i++) {
        angles.push((angle_deg + degree_inc * i) * Math.PI / 180.0);
        angles.push((angle_deg - degree_inc * i) * Math.PI / 180.0);
    }

    arrow_orientations = angles.map((angle) => { 
        return {x: -Math.sin(angle), y: 0, z: Math.cos(angle)}; 
    });
    
    arrow_distance_range = {min: 0, max: 500};

    arrow_particle_trigger.register();
    setTimeout(() => { arrow_particle_trigger.unregister() }, 2_000);
}

Settings.registerSetting("Next Burrow Guesser", "hitBlock", (block) => {
    if (block?.type?.getID() === 2)
        last_hit_grass_position = block.pos;
});
Settings.registerSetting("Next Burrow Guesser", "playerInteract", () => {
    const block = Player.lookingAt();
    if (block?.type?.getID() === 2)
        last_hit_grass_position = block.pos;
});
function findBurrowDug() {
    const block = Player.lookingAt();
    if (block?.type?.getID() !== 2) {
        if (last_hit_grass_position)
            return last_hit_grass_position;
        else {
            let closest = closestBurrow(5);
            if (!closest) return undefined;
            return new Vec3i(closest.position.x, closest.position.y, closest.position.z);
        }
    }
    else
        return block.pos;
}

function labelBurrowDug(burrow_chain_number) {
    guess_position = undefined;
    guess_waypoint.hide();
    
    arrow_position = undefined;
    arrow_orientations = [];
    arrow_color = undefined;
    
    spade_last_position = undefined;
    spade_last_orientation = undefined;

    spade_positions = [];
    spade_pitch_count = 0;
    spade_orientation = undefined;
    spade_pitch_distance = undefined;
    spade_pitch_position = undefined;
    guess_positions = [];
    
    let block_position = findBurrowDug();
    if (!block_position) return;

    arrow_position = {x: block_position.x + 0.5, y: block_position.y + 2, z: block_position.z + 0.5};
    guess_waypoint.setPosition(block_position.x, block_position.y, block_position.z);

    if (burrow_chain_number === "4") {
        arrow_color = "NONE";
        return;
    }

    findArrowOrientation(block_position);
    Client.scheduleTask(2, () => { // extra attempt to find arrow incase of low tps
        if (arrow_orientations.length > 0) return;
        findArrowOrientation(block_position);
    });
}

const warp_key = createKeyBind("Burrow Guess Warp", 0, "TimyAddons");
warp_key.registerKeyPress(() => {
    setGuess(guess_position);
    if (!guess_warp) return;
    warping_message_trigger.register();
    queueCommand(`warp ${guess_warp}`);
    setTimeout(() => {
        warping_message_trigger.unregister();
    }, 1000);
});
const warping_message_trigger = register("chat", () => {
    setGuess(guess_position);
    if (guess_warp in HUB_WARPS_TRUE_COORDINATES) 
        guess_waypoint.setVisualPosition(
            HUB_WARPS_TRUE_COORDINATES[guess_warp].x, 
            HUB_WARPS_TRUE_COORDINATES[guess_warp].y, 
            HUB_WARPS_TRUE_COORDINATES[guess_warp].z
        );

    warping_message_trigger.unregister();
}).setCriteria("&r&7Warping...&r");
warping_message_trigger.unregister();

Settings.registerSetting("Next Burrow Guesser", "chat", labelBurrowDug)
    .setCriteria("&r&eYou dug out a Griffin Burrow! &r&7(${burrow_chain_number}/4)&r")
    .requireArea("Hub");
Settings.registerSetting("Next Burrow Guesser", "chat", labelBurrowDug)
    .setCriteria("&r&eYou finished the Griffin burrow chain! &r&7(${burrow_chain_number}/4)&r")
    .requireArea("Hub");
Settings.registerSetting("Next Burrow Guesser", "playerInteract", () => {
    if (spade_on_cooldown) return;
    if (!isHoldingSkyblockItem("ANCESTRAL_SPADE")) return;

    spade_player_position = {x: Player.getX(), y: Player.getY(), z: Player.getZ()};
    if (!guess_waypoint.visible)
        guess_waypoint.setPosition(spade_player_position.x, spade_player_position.y, spade_player_position.z);
    
    if (spade_positions.length > 0 && spade_orientation) {
        spade_last_position = spade_positions[spade_positions.length - 1];
        spade_last_orientation = spade_orientation;
    }
    
    spade_positions = [];
    spade_pitch_count = 0;
    spade_dot_product = -1.0;
    spade_orientation = undefined;
    spade_pitch_distance = undefined;
    spade_pitch_position = undefined;

    spade_particle_trigger.register();
    setTimeout(() => { spade_particle_trigger.unregister() }, 3_000);
    spade_sound_trigger.register();
    setTimeout(() => { spade_sound_trigger.unregister() }, 3_000);
    spade_on_cooldown = true;
    setTimeout(() => { spade_on_cooldown = false; }, 3_000);
}).requireArea("Hub");

Settings.addAction("Next Burrow Guesser", resetState);
Settings.registerSetting("Next Burrow Guesser", "worldLoad", resetState);

const GUESS_NAMES = [
    "Spade Triangulate",
    "Grass Collision Block",
    "Spade Pitch Distance"
];
DeveloperSettings.registerSetting("Display Individual Technique Guesses", "renderWorld", (partial_ticks) => {
    guess_positions.forEach((pos, i) => {
        if (!pos) return;
        if (i - arrow_orientations.length >= GUESS_NAMES.length) return;
        drawWaypoint(i < arrow_orientations.length ? `Arrow Triangulate ${i+1}` : GUESS_NAMES[i - arrow_orientations.length], pos.x - 0.5, pos.y, pos.z - 0.5, 1.0, 0.0, 1.0, false);
    });
}).requireArea("Hub");

function closestBurrow(max_range = undefined, x = Player.getX(), z = Player.getY()) {
    let closest = undefined;
    let closest_distance_sq = undefined;
    for (let key in burrows) {
        if (burrows[key].max_count < PARTICLE_SHOW_COUNT && !burrows[key].position_confirmed) continue;
        let distance_sq = (x - burrows[key].position.x)**2 + (z - burrows[key].position.z)**2;
        if ((!closest || closest_distance_sq > distance_sq) && (max_range && distance_sq < max_range**2) ) {
            closest = burrows[key];
            closest_distance_sq = distance_sq;
        }
    }
    return closest;
}

function removeBurrowDug(burrow_chain_number) {
    holding_spade = false;
    let block_position = findBurrowDug();
    if (!block_position) return;

    let key = `${block_position.x},${block_position.z}`;

    if (key in burrows) {
        removeBurrow(key);
        recently_removed_burrows.push(key);
        Client.scheduleTask(100, () => {
            if (recently_removed_burrows.length > 0) {
                recently_removed_burrows.shift();
            }
        });
    }
};
var holding_spade = false;

// Waypoint Colors
var burrow_colors = {
    burrow: {
        r: WaypointColorSettings.color_burrow.getRed() / 255, 
        g: WaypointColorSettings.color_burrow.getGreen() / 255, 
        b: WaypointColorSettings.color_burrow.getBlue() / 255
    },
    mob: {
        r: WaypointColorSettings.color_mob.getRed() / 255, 
        g: WaypointColorSettings.color_mob.getGreen() / 255, 
        b: WaypointColorSettings.color_mob.getBlue() / 255
    },
    treasure: {
        r: WaypointColorSettings.color_treasure.getRed() / 255, 
        g: WaypointColorSettings.color_treasure.getGreen() / 255, 
        b: WaypointColorSettings.color_treasure.getBlue() / 255
    }
};
var burrow_particle_types = {
    "FOOTSTEP": {color: burrow_colors.burrow, type: "Burrow"},
    "CRIT": {color: burrow_colors.mob, type: "Mob Burrow"},
    "DRIP_LAVA": {color: burrow_colors.treasure, type: "Treasure Burrow"},
    "CRIT_MAGIC": {color: burrow_colors.burrow, type: "Burrow"},
}
var guess_color = {
    r: WaypointColorSettings.color_guess.getRed() / 255,
    g: WaypointColorSettings.color_guess.getGreen() / 255,
    b: WaypointColorSettings.color_guess.getBlue() / 255,
}
WaypointColorSettings.addAction("Guess Waypoint Color", (color) => {
    guess_color.r = color.getRed() / 255;
    guess_color.g = color.getGreen() / 255;
    guess_color.b = color.getBlue() / 255;
    guess_waypoint.setColor(
        guess_color.r,
        guess_color.g,
        guess_color.b
    );
});
WaypointColorSettings.addAction("Burrow Waypoint Color", (color) => {
    burrow_colors.burrow.r = color.getRed() / 255;
    burrow_colors.burrow.g = color.getGreen() / 255;
    burrow_colors.burrow.b = color.getBlue() / 255;
});
WaypointColorSettings.addAction("Mob Burrow Waypoint Color", (color) => {
    burrow_colors.mob.r = color.getRed() / 255;
    burrow_colors.mob.g = color.getGreen() / 255;
    burrow_colors.mob.b = color.getBlue() / 255;
});
WaypointColorSettings.addAction("Treasure Burrow Waypoint Color", (color) => {
    burrow_colors.treasure.r = color.getRed() / 255;
    burrow_colors.treasure.g = color.getGreen() / 255;
    burrow_colors.treasure.b = color.getBlue() / 255;
});

// Found Burrow Waypoints
Settings.registerSetting("Found Burrow Waypoints", "spawnParticle", (particle, type, event) => {
    if (!isHoldingSkyblockItem("ANCESTRAL_SPADE")) return;
    type = type.toString();
    if (!["FOOTSTEP", "CRIT", "DRIP_LAVA", "CRIT_MAGIC"].includes(type))
        return;

    let block_position = {x: Math.floor(particle.getX()), y: Math.floor(particle.getY()), z: Math.floor(particle.getZ())}
    let key = `${block_position.x},${block_position.z}`;

    if (recently_removed_burrows.includes(key)) {
        return;
    }
    
    let on_grass = false;
    for (let i = 0; !on_grass && i < 2; i++) {
        let block = World.getBlockAt(block_position.x, block_position.y, block_position.z);
        if (block?.type?.getID() !== 2) {
            block_position.y -= 1;
        }
        else on_grass = true;
    }
    if (!on_grass) return;
    
    holding_spade = true;

    // Update burrow data or create new burrow object
    if (key in burrows) {
        if (burrows[key].count < 40) burrows[key].count++;
        if (burrows[key].count > burrows[key].max_count) 
            burrows[key].max_count = burrows[key].count;
        burrows[key].time = Date.now();
    }
    else {
        burrows[key] = {
            position: block_position,
            position_confirmed: false,
            type: burrow_particle_types[type]?.type,
            color: burrow_particle_types[type]?.color,
            count: 0,
            max_count: 0,
            type_counts: {"FOOTSTEP": 0, "CRIT": 0, "DRIP_LAVA": 0, "CRIT_MAGIC": 0},
            time: Date.now(),
            onscreen: true
        };
    }
    
    const neighboring_confirmed_burrow = 
           (burrows[`${block_position.x - 1},${block_position.z}`]?.position_confirmed) 
        || (burrows[`${block_position.x + 1},${block_position.z}`]?.position_confirmed) 
        || (burrows[`${block_position.x},${block_position.z - 1}`]?.position_confirmed) 
        || (burrows[`${block_position.x},${block_position.z + 1}`]?.position_confirmed) 
        || (burrows[`${block_position.x - 1},${block_position.z + 1}`]?.position_confirmed) 
        || (burrows[`${block_position.x - 1},${block_position.z - 1}`]?.position_confirmed) 
        || (burrows[`${block_position.x + 1},${block_position.z + 1}`]?.position_confirmed) 
        || (burrows[`${block_position.x + 1},${block_position.z - 1}`]?.position_confirmed);

    // footstep particles near the center of the block can confirm a position only if neighboring blocks are not confirmed
    if (!burrows[key].position_confirmed && !neighboring_confirmed_burrow && type === "FOOTSTEP" 
        && Math.abs( (particle.getX() - 0.5) % 1.0) <= 0.3 && Math.abs( (particle.getZ() - 0.5) % 1.0) <= 0.3 )
    {
        if (guess_position) {
            let distance_sq = (guess_position.x - block_position.x)**2 + (guess_position.z - block_position.z)**2;
            if (distance_sq < GUESS_ALIGN_DISTANCE**2)
                setGuess(block_position);
        }
        burrows[key].position_confirmed = true;
    }
    
    if (neighboring_confirmed_burrow) {
        burrows[key].position_confirmed = false;
    }
    
    if (type !== "FOOTSTEP")
        burrows[key].type_counts[type]++;
    
    // determine the type of the burrow
    let most_key = "FOOTSTEP";
    for (let type_key in burrows[key].type_counts) {
        if (burrows[key].type_counts[type_key] > burrows[key].type_counts[most_key])
            most_key = type_key;
    }
    
    burrows[key].type = burrow_particle_types[most_key].type;
    burrows[key].color = burrow_particle_types[most_key].color;

    if (guess_key === key) setGuess(guess_position);
}).requireArea("Hub");

var holding_spade_ticks = 0;
Settings.registerSetting("Found Burrow Waypoints", "tick", () => {
    const current_time = Date.now();

    for (let key in burrows) {
        if (!burrows[key].time || burrows[key].time < current_time - 60_000) 
            removeBurrow(key);
        if (!burrows[key].position_confirmed) {
            burrows[key].count--;
            if (burrows[key].count < -20) 
                removeBurrow(key);
        }
    }
    
    if (!isHoldingSkyblockItem("ANCESTRAL_SPADE")) {
        holding_spade = false;
        holding_spade_ticks = 0;
    }
    else if (++holding_spade_ticks >= 20)
        holding_spade = true;
    
    if (!holding_spade) return;

    for (let key in burrows) {
        let distance_sq = (Player.getX() - burrows[key].position.x)**2 + (Player.getY() - burrows[key].position.y)**2 + (Player.getZ() - burrows[key].position.z)**2;
        if (distance_sq > 1028) continue;
        
        if (burrows[key].position_confirmed) {
            burrows[key].count--;
            if (burrows[key].count < -20) 
                removeBurrow(key);
        }
    }
}).requireArea("Hub");

function removeBurrow(key) {
    burrows[key].type = undefined;
    burrows[key].count = -19;
    Client.scheduleTask(5, () => {
        delete burrows[key];
    });
}

Settings.registerSetting("Found Burrow Waypoints", "chat", removeBurrowDug)
    .setCriteria("&r&eYou dug out a Griffin Burrow! &r&7(${burrow_chain_number}/4)&r")
    .requireArea("Hub");
Settings.registerSetting("Found Burrow Waypoints", "chat", removeBurrowDug)
    .setCriteria("&r&eYou finished the Griffin burrow chain! &r&7(${burrow_chain_number}/4)&r")
    .requireArea("Hub");

const PARTICLE_SHOW_COUNT = 5;
DeveloperSettings.registerSetting("Display Burrow Detection Info", "renderWorld", (partial_ticks) => {
    for (let key in burrows) {
        if (!burrows[key]?.type) continue;
        drawWorldString(
            `confirmed: ${ burrows[key].position_confirmed ? "§a✓" : "§c✗" }§r, count:§${burrows[key].count < PARTICLE_SHOW_COUNT ? "c" : "a"} ${burrows[key].count}§r, max:§${burrows[key].max_count < PARTICLE_SHOW_COUNT ? "c" : "a"} ${burrows[key].max_count}`, 
            burrows[key].position.x + 0.5, 
            burrows[key].position.y + 2.0, 
            burrows[key].position.z + 0.5,
            1.0, true, false, guess_key === key ? 2 : 1
        );
    }
}).requireArea("Hub");
Settings.registerSetting("Found Burrow Waypoints", "renderWorld", (partial_ticks) => {
    for (let key in burrows) {
        if (!burrows[key]?.type) continue;
        if (burrows[key].max_count < PARTICLE_SHOW_COUNT && !burrows[key].position_confirmed)
            continue;
        if (guess_key !== key) drawWaypoint(
            burrows[key].onscreen ? burrows[key].type : "",
            burrows[key].position.x, burrows[key].position.y, burrows[key].position.z, 
            burrows[key].color.r, burrows[key].color.g, burrows[key].color.b, false, true,
            Settings.waypoint_show_arrow > 1 && (Settings.waypoint_arrow_style == 1 || Settings.waypoint_arrow_style == 3)
                ? (Settings.waypoint_show_arrow_label == 2 ? 3 : 2)
                : 0
        );
    }
}).requireArea("Hub");

Settings.registerSetting("Found Burrow Waypoints", "renderOverlay", () => {
    if (Settings.waypoint_show_arrow < 2) return;
    for (let key in burrows) {
        if (!burrows[key]?.type) continue;
        if (burrows[key].max_count < PARTICLE_SHOW_COUNT && !burrows[key].position_confirmed)
            continue;
        if (guess_key !== key) {
            burrows[key].onscreen = !drawOffscreenPointer(
                burrows[key].position.x + 0.5, burrows[key].position.y + 0.5, burrows[key].position.z + 0.5, 
                burrows[key].color.r, burrows[key].color.g, burrows[key].color.b,
                Settings.waypoint_show_arrow_label == 2 ? burrows[key].type : undefined,
                Settings.waypoint_show_distance,
                Settings.waypoint_arrow_style >= 2
            );
        }
    }
}).requireArea("Hub");

Settings.registerSetting("Found Burrow Waypoints", "worldLoad", () => { burrows = {}; });
Settings.addAction("Found Burrow Waypoints", () => { burrows = {}; });

const announce_inquisitor_message = [undefined, "ac", "pc", "cc"];
Settings.registerSetting("Announce Minos Inquisitor", "chat", () => {
    let block_position = findBurrowDug();
    if (!block_position)
        block_position = {x: Math.floor(Player.getX()), y: Math.floor(Player.getY()), z: Math.floor(Player.getZ())};
    queueCommand(`${announce_inquisitor_message[Settings.mythological_announce_minos_inquisitor]} x: ${block_position.x}, y: ${block_position.y}, z: ${block_position.z} Minos Inquisitor`);
}).setCriteria("&r${*}! &r&eYou dug out a &r&2Minos Inquisitor&r&e!&r").requireArea("Hub");

DeveloperSettings.registerSetting("Display Arrow and Spade Lines", "renderWorld", (partial_ticks) => {
    GL11.glLineWidth(2);
    GL11.glDisable(GL11.GL_TEXTURE_2D);
    Tessellator.disableDepth();
    Tessellator.disableLighting();

    GlStateManager.func_179094_E(); // pushMatrix()
    if (arrow_position) arrow_orientations.forEach((arrow_orientation) => {
        Tessellator.begin(3);
        Tessellator.translate(arrow_position.x, Player.getRenderY(), arrow_position.z);
        Tessellator.pos(arrow_orientation.x * arrow_distance_range.min, 0, arrow_orientation.z * arrow_distance_range.min);
        Tessellator.pos(arrow_orientation.x * arrow_distance_range.max, 0, arrow_orientation.z * arrow_distance_range.max);
        Tessellator.draw();
    }); 
    
    if (spade_orientation && spade_positions.length > 0 && spade_end_segment) {
        for (let i = 0; i < spade_positions.length - 1; i++) {
            Tessellator.begin(3);
            Tessellator.colorize(0.2, 0.5, 0.2);
            Tessellator.translate(spade_positions[i].x, spade_positions[i].y, spade_positions[i].z);
            Tessellator.pos(0, 0, 0);
            Tessellator.pos(spade_positions[i + 1].x - spade_positions[i].x, spade_positions[i + 1].y - spade_positions[i].y, spade_positions[i + 1].z - spade_positions[i].z);
            Tessellator.draw();
        }

        Tessellator.begin(3);
        Tessellator.colorize(0.0, 1.0, 0.0);
        Tessellator.translate(spade_positions[spade_positions.length - 1].x, spade_positions[spade_positions.length - 1].y, spade_positions[spade_positions.length - 1].z);
        Tessellator.pos(0, 0, 0);
        Tessellator.pos(spade_end_segment.x, spade_end_segment.y, spade_end_segment.z);
        Tessellator.draw();
    }
    
    if (spade_last_orientation && spade_last_position) {
        Tessellator.begin(3);
        Tessellator.colorize(0.0, 0.0, 1.0);
        Tessellator.translate(spade_last_position.x, spade_last_position.y, spade_last_position.z);
        Tessellator.pos(0, 0, 0);
        Tessellator.pos(spade_last_orientation.x * 500, spade_last_orientation.y * 500, spade_last_orientation.z * 500);
        Tessellator.draw();
    }

    Tessellator.enableDepth()
    Tessellator.enableLighting();
    GlStateManager.func_179121_F(); // popMatrix()
    GL11.glEnable(GL11.GL_TEXTURE_2D);
}).requireArea("Hub");

/*
var correct_map = false;
var range = 20;
register("renderWorld", (partial_ticks) => {
    const min_x = Math.floor(Player.getX()) - range;
    const max_x = Math.floor(Player.getX()) + range;
    const min_z = Math.floor(Player.getZ()) - range;
    const max_z = Math.floor(Player.getZ()) + range;
    GL11.glLineWidth(2);
    GL11.glDisable(GL11.GL_TEXTURE_2D);
    GlStateManager.func_179094_E(); // pushMatrix()
    Tessellator.disableLighting();
    
    for (let x = min_x; x < max_x; x++) for (let z = min_z; z < max_z; z++) {
        if (x > -82 && x < 75 && z > -100 && z < 0) {
            if (correct_map) setGrassHeight(x, 0, z);
            continue;
        }
        let y = getGrassHeight(x, z);
        if (!y) {
            let search_y;
            for (search_y = 71; search_y <= 100 && World.getBlockAt(x, search_y, z)?.type?.getID() !== 2; search_y++);
            if (search_y !== 101 && World.getBlockAt(x, search_y + 1, z)?.type?.getID() === 0) {
                drawOutlinedPlane(x, search_y + 1, z, 0.25, 0.25, 1.0);
                if (correct_map) setGrassHeight(x, search_y, z);
            }

            continue;
        }
        let verified = true;

        if (World.getBlockAt(x, y, z)?.type?.getID() !== 2)
            verified = false;
        if (World.getBlockAt(x, y + 1, z)?.type?.getID() !== 0) {
            drawOutlinedBox(x, y + 1, z, 1.0, 0.25, 0.25);
            verified = false;
        }
            
        if (!verified) {
            drawOutlinedPlane(x, y + 1, z, 1.0, 0.25, 0.25);
            if (correct_map) setGrassHeight(x, 0, z);
        }
        else
            drawOutlinedPlane(x, y + 1, z, 0.25, 1.0, 0.25);
    }
    
    Tessellator.enableLighting();
    GlStateManager.func_179121_F(); // popMatrix()
    GL11.glEnable(GL11.GL_TEXTURE_2D);
});

register("command", () => { saveGrassHeightMap(); }).setName("savegrassheightmap");
register("command", () => { correct_map = !correct_map }).setName("togglecorrectgrassheightmap");
register("command", (arg1) => { range = parseInt(arg1) }).setName("rendergrassheightmaprange");
// */