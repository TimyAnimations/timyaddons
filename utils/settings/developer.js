import { 
    @Vigilant, 
    @ButtonProperty 
    @SwitchProperty, 
    @SelectorProperty, 
    @SliderProperty, 
    @TextProperty, 
    @CheckboxProperty, 
    @ColorProperty, 
    @PercentSliderProperty,
    Color 
} from "Vigilance";
import { @Triggable } from "./triggerable_settings";

@Triggable()
@Vigilant("TimyAddons/data/developer", "Timy Addons - Developer Settings", {
    getCategoryComparator: () => (a, b) => {
        const categories = [
            "Welcome",
            "General", "Crimson Isles", "Crystal Hollows", 
            "Garden", "Slayer", "Dungeons", "Kuudra", 
            "Bestiary", "Combat", "Mining", "Fishing", "Mythological", 
            "Events", "Waypoint", "Widgets", "Items"
        ];

        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})
class Settings {
    constructor() {
        this.initialize(this);
    }
    @SwitchProperty({
        name: "Display Arrow and Spade Lines",
        description: "These lines are used to triangulate the position of the next burrow",
        category: "Mythological",
    })
    mythological_dev_lines = false;
    @SwitchProperty({
        name: "Display Individual Technique Guesses",
        description: "The guess waypoint takes the average position of these locations, but useful if you want to see the prediction individual techiques came up with",
        category: "Mythological",
    })
    mythological_dev_positions = false;
    @SwitchProperty({
        name: "Display Burrow Detection Info",
        description: "Display's information about the burrow detection system, like particle count, and confirmed position",
        category: "Mythological",
    })
    mythological_dev_burrow_particle = false;
    @SwitchProperty({
        name: "Cost Value Breakdown for Upgrades",
        description: "Display's the calculated cost and value of each upgrade in the format (COST | VALUE | COST PER VALUE)",
        category: "Events",
    })
    event_chocolate_timer_value = false;
    @SwitchProperty({
        name: "Cumulative Time Tower Upgrades",
        category: "Events",
    })
    event_chocolate_cumulative_time_tower = false;
    @SwitchProperty({
        name: "Cumulative Rabbit Shrine Upgrades",
        category: "Events",
    })
    event_chocolate_cumulative_rabbit_shrine = false;
    @SwitchProperty({
        name: "Shop Milestone \"Upgrades\"",
        category: "Events",
    })
    event_chocolate_shop_milestone = false;
}

export default new Settings();