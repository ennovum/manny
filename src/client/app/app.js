import es6Promise from "es6Promise";
import _ from "lodash";
import angular from "angular";
import "angularRoute";

import routing from "./routing.js";

import "./../components/refinance/refinance.js";
import "./../components/verdict/verdict.js";

es6Promise.polyfill();

angular
    .module("app", ["ngRoute", "refinance", "verdict"])
    .config(["$routeProvider", ($routeProvider) => {
        _.forEach(routing.routes, (route, path) => $routeProvider.when(path, route));

        $routeProvider.otherwise({
            "redirectTo": routing.defaultPath
        });
    }]);

export default class App {
    run() {
        angular.bootstrap(document, ["app"]);
    }
}
