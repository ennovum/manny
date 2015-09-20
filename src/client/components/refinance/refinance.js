import angular from "angular";

import RefinanceClient from "./refinance-client.js";

angular
    .module("refinance", [])
    .service("refinanceClient", RefinanceClient.service);
