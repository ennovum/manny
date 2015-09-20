import angular from "angular";

import VerdictController from "./verdict-controller.js";
import VerdictDirective from "./verdict-directive.js";

angular
    .module("verdict", [])
    .controller("verdict", VerdictController.controller)
    .directive("verdict", VerdictDirective.directive);
