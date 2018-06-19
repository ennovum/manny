class Injector {
    constructor() {
        this._injectables = {};
    }

    set(name, instance) {
        const injectable = this._injectables[name] || {};
        injectable.instance = instance;
        this._injectables[name] = injectable;
    }

    get(name) {
        const injectable = this._injectables[name] || {};
        injectable.instance || (injectable.factory && (this.instantiate(name, injectable.factory)));
        return injectable.instance;
    }

    register(name, factory) {
        this._injectables[name] = {factory};
    }

    instantiate(name, factory) {
        const dependencies = factory.$inject || [];
        const instance = factory.apply(null, dependencies.map((dependency) => this.get(dependency)));
        this.set(name, instance);
    }
}

const injector = new Injector();

export default injector;
