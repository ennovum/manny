import injector from "injector";

import RefinanceHandler from "./refinance-handler.js";
import RefinanceAnalizer from "./refinance-analizer.js";

injector.register("refinanceHandler", RefinanceHandler.factory);
injector.register("refinanceAnalizer", RefinanceAnalizer.factory);
