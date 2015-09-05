import _ from "lodash";
import injector from "injector";

import config from "./../../config/config.js";

class MoneyplHandler {
    constructor() {
        this._client = injector.get("moneyplClient");
    }

    history(req, res) {
        let symbols = config.moneypl.symbols;

        let nowDate = new Date();
        let fromDate = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1, nowDate.getDate(), 0, 0, 0, 0);
        let toDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 0, 0, 0, 0);

        Promise.all(_.map(symbols, (symbol) => this._client.getFundHistory(symbol, fromDate, toDate)))
            .then((historyResults) => {
                res.send(historyResults);
            }, (err) => {
                res.status(500).send(err);
            });
    }
}

MoneyplHandler.factory = () => new MoneyplHandler();
MoneyplHandler.factory.$inject = [];

export default MoneyplHandler;
