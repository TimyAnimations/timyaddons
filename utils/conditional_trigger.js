import { requireArea, requireContainer } from "./skyblock";

export class ConditionalTrigger {
    unregistered = false;
    action = () => {};
    condition_func(value) {
        return this.condition_funcs.reduce((accum, func) => {
            return accum && func(value) 
        }, true);
    }
    condition_funcs = [];
    
    constructor(trigger, ...condition_funcs) {
        this.trigger = trigger;
        this.method = trigger.method;
        this.type = trigger.type;
        this.condition_funcs = condition_funcs;
        if (!this.condition_func())
            trigger.unregister();
        }

    register() {
        this.unregistered = false;
        if (this.condition_func())
            this.trigger.register();
        this.action(this.condition_func());
        return this;
    }

    unregister() {
        this.unregistered = true;
        this.trigger.unregister();
        this.action(this.condition_func());
        return this;
    }

    update(value) {
        if (!this.unregistered && this.condition_func(value))
            this.trigger.register();
        else
            this.trigger.unregister();

        this.action(this.condition_func(value));
        return this;
    }

    setAction(method) {
        this.action = method;
        return this;
    }

    // requireSetting(name, condition_func = (value) => value) {
    //     const property = Settings.findPropID(name);
    //     Settings.addAction(name, (value) => this.update(value) );
    //     this.condition_funcs.push((value = Settings[property]) => { return condition_func(value); })
    // }

    
    requireArea = (area) => requireArea(area, this);
    requireContainer = (container) => requireContainer(container, this);

    compareTo(other) {
        this.trigger.compareTo(other);
        return this;
    }
    setPriority(priority) {
        this.trigger.setPriority(priority);
        return this;
    }
    addParameter(parameter) {
        this.trigger.addParameter(parameter);
        return this;
    }
    addParameters(...parameters) {
        this.trigger.addParameters(...parameters);
        return this;
    }
    setCaseInsensitive() {
        this.trigger.setCaseInsensitive();
        return this;
    }
    setChatCriteria(chatCriteria) {
        this.trigger.setChatCriteria(chatCriteria);
        return this;
    }
    setContains() {
        this.trigger.setContains();
        return this;
    }
    setCriteria(chatCriteria) {
        this.trigger.setCriteria(chatCriteria);
        return this;
    }
    setEnd() {
        this.trigger.setEnd();
        return this;
    }
    setExact() {
        this.trigger.setExact();
        return this;
    }
    setParameter(parameter) {
        this.trigger.setParameter(parameter);
        return this;
    }
    setParameters(...parameters) {
        this.trigger.setParameters(...parameters);
        return this;
    }
    setStart() {
        this.trigger.setStart();
        return this;
    }
    triggerIfCanceled() {
        this.trigger.triggerIfCanceled();
        return this;
    }
    setDelay(seconds) {
        this.trigger.setDelay(seconds);
        return this;
    }
    setFps(fps) {
        this.trigger.setFps(fps);
        return this;
    }
}