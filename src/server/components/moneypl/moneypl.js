import injector from "injector";

import MoneyplHandler from "./moneypl-handler.js";
import MoneyplApiClient from "./moneypl-api-client.js";

injector.register("moneyplHandler", MoneyplHandler.factory);
injector.register("moneyplClient", MoneyplApiClient.factory);
