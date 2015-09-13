import _ from "lodash";
import injector from "injector";

import config from "./../../config/config.js";

class RefinanceHandler {
    constructor() {
        this._client = injector.get("moneyplClient");
        this._analizer = injector.get("refinanceAnalizer");
    }

    verdict(req, res) {
        let symbols = config.refinance.symbols;

        let date = req.query.date ? new Date(req.query.date) : new Date();
        let fromDate = new Date(date.getFullYear() - 1, date.getMonth(), date.getDate(), 0, 0, 0, 0);
        let toDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

        Promise.all(_.map(symbols, (symbol) => this._client.getFundHistoryResult(symbol, fromDate, toDate)))
            .then((fundHistoryResults) => this._analizer.getVerdictResult(fundHistoryResults, date))
            .then((verdictResult) => {
                res.send(verdictResult);
            }, (err) => {
                res.status(500).send(err);
            });
    }
}

RefinanceHandler.factory = () => new RefinanceHandler();
RefinanceHandler.factory.$inject = [];

export default RefinanceHandler;
