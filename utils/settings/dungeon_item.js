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
@Vigilant("TimyAddons/data/dungeon_items", "Timy Addons - Dungeon Items", {
    getCategoryComparator: () => (a, b) => {
        const categories = [
            "General", "Crimson Isles", "Crystal Hollows", 
            "Garden", "Slayer", "Dungeons", "Kuudra", 
            "Bestiary", "Combat", "Fishing", "Mythological", 
            "Waypoint", "Items"
        ];

        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})
class Settings {
    constructor() {
        this.initialize(this);
    }

    @SliderProperty({
        name: "&9Spirit Leap&r Count",
        description: "Set to 0 to disable this item",
        category: "Dungeons",
        subcategory: "Item Lists",
        min: 0, max: 16
    })
    dungeon_item_SPIRIT_LEAP = 15;
    @SliderProperty({
        name: "&aDecoy&r Count",
        description: "Set to 0 to disable this item",
        category: "Dungeons",
        subcategory: "Item Lists",
        min: 0, max: 64
    })
    dungeon_item_DUNGEON_DECOY = 63;
    @SliderProperty({
        name: "&fEnder Pearl&r Count",
        description: "Set to 0 to disable this item",
        category: "Dungeons",
        subcategory: "Item Lists",
        min: 0, max: 16
    })
    dungeon_item_ENDER_PEARL = 16;
    @SliderProperty({
        name: "&9Superboom TNT&r Count",
        description: "Set to 0 to disable this item",
        category: "Dungeons",
        subcategory: "Item Lists",
        min: 0, max: 64
    })
    dungeon_item_SUPERBOOM_TNT = 63;
    @SliderProperty({
        name: "&fInflatable Jerry&r Count",
        description: "Set to 0 to disable this item",
        category: "Dungeons",
        subcategory: "Item Lists",
        min: 0, max: 64
    })
    dungeon_item_INFLATABLE_JERRY = 1;
    @SliderProperty({
        name: "&aTrap&r Count",
        description: "Set to 0 to disable this item",
        category: "Dungeons",
        subcategory: "Item Lists",
        min: 0, max: 64
    })
    dungeon_item_DUNGEON_TRAP = 1;
    @SliderProperty({
        name: "&9Dungeon Chest Key&r Count",
        description: "Set to 0 to disable this item",
        category: "Dungeons",
        subcategory: "Item Lists",
        min: 0, max: 64
    })
    dungeon_item_DUNGEON_CHEST_KEY = 1;
}

export default new Settings();