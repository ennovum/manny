import template from "./verdict.html";

class VerdictDirective {
    constructor() {
        this.restrict = "E";
        this.template = template;
        this.scope = {};
        this.controller = "verdict";
        this.controllerAs = "ctrl";
        this.bindToController = true;
    }
}

VerdictDirective.directive = () => new VerdictDirective();
VerdictDirective.directive.$inject = [];

export default VerdictDirective;
