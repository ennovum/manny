import _ from "lodash";
import moment from "moment";
import injector from "injector";

import config from "./../../config/config.js";

const RECENT_DURATION = moment.duration({months: 1});

export default class RefinanceHandler {
    constructor() {
        this._client = injector.get("moneyplClient");
        this._analizer = injector.get("refinanceAnalizer");
    }

    verdict(req, res) {
        let symbols = config.refinance.symbols;

        let endMoment = moment(req.query["end-date"]).set({hour: 0, minute: 0, second: 0, millisecond: 0});
        let recentMoment = moment(endMoment).subtract(RECENT_DURATION);
        let seasonMoment = moment(req.query["season-date"]).set({hour: 0, minute: 0, second: 0, millisecond: 0});
        let startMoment = moment.min(seasonMoment, recentMoment);

        let endDate = endMoment.toDate();
        let recentDate = recentMoment.toDate();
        let seasonDate = seasonMoment.toDate();
        let startDate = startMoment.toDate();

        Promise.all(_.map(symbols, (symbol) => this._client.getFundHistoryResult(symbol, startDate, endDate)))
            .then((fundHistoryResults) => this._analizer.getVerdictResult(fundHistoryResults, endDate, recentDate, seasonDate))
            .then((verdictResult) => {
                res.send(verdictResult);
            }, (err) => {
                res.status(500).send(err);
            });
    }
}

RefinanceHandler.factory = () => new RefinanceHandler();
RefinanceHandler.factory.$inject = [];
