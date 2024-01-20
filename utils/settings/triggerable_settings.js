import { ConditionalTrigger } from "../conditional_trigger";
import { requireArea, registerArea, requireContainer } from "../skyblock";

export decorator @Triggable() {
    @wrap((clazz) => {
        clazz.prototype.property_triggers = {};
        clazz.prototype.findPropID = function(name) {
            return Object.keys(this.__config_props__).find(
                prop => this.__config_props__[prop].name === name
            );
        }
    
        clazz.prototype.findProp = function(name) {
            return this[this.findPropID(name)];
        }
    
        clazz.prototype.registerSetting = function(name, trigger_type, method, condition_func = (value) => value) {
            if (!this.__config_props__ ) return;
            const property = Object.keys(this.__config_props__).find(
                prop => this.__config_props__[prop].name === name
            );
            if (!property) return;
    
            const trigger = new ConditionalTrigger(register(trigger_type, method), (value = this[property]) => { return condition_func(value); });
    
            if (!(property in this.property_triggers))
                this.property_triggers[property] = [];
            this.property_triggers[property].push((value) => trigger.update(value));
    
            this.registerListener(name, (value) => {
                this.property_triggers[property].forEach(func => func(value));
            });
    
            return trigger;
        }
    
        clazz.prototype.addTrigger = function(name, trigger) {
            const property = this.findPropID(name);
            if (!property) return;
    
            if (!(property in this.property_triggers))
                this.property_triggers[property] = [];
            this.property_triggers[property].push(
                trigger instanceof ConditionalTrigger 
                    ? (value) => trigger.update(value)
                    : (value) => { if (value) trigger.register(); else trigger.unregister() }
            );
    
            this.registerListener(name, (value) => {
                this.property_triggers[property].forEach(func => func(value))
            });
        }

        clazz.prototype.updateValue = function(name, value) {
            const property = this.findPropID(name);
            if (!property) return;
            
            this[property] = value;
            if (property in this.property_triggers) {
                this.property_triggers[property].forEach(func => func(value));
            }
        }
    
        clazz.prototype.addAction = function(name, method) {
            const property = this.findPropID(name);
            if (!property) return;
    
            if (!(property in this.property_triggers))
                this.property_triggers[property] = [];
            this.property_triggers[property].push(method);
    
            this.registerListener(name, (value) => {
                this.property_triggers[property].forEach(func => func(value))
            });
        }
        return clazz;
    })
}