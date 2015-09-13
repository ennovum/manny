import injector from "injector";

export default class MoneyplHandler {
    constructor() {
        this._client = injector.get("moneyplClient");
    }

    history(req, res) {
        let symbol = req.query.symbol;
        let from = req.query.from;
        let to = req.query.to;

        let fromDate = new Date(from);
        let toDate = new Date(to);

        this._client.getFundHistory(symbol, fromDate, toDate)
            .then((historyResult) => {
                res.send(historyResult);
            }, (err) => {
                res.status(500).send(err);
            });
    }
}

MoneyplHandler.factory = () => new MoneyplHandler();
MoneyplHandler.factory.$inject = [];
