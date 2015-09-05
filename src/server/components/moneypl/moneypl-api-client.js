import _ from "lodash";
import request from "request";

const API_URL_FUND_HISTORY = "http://www.money.pl/fundusze/archiwum/fundusze/";

class MoneyplApiClient {
    getFundHistory(symbol, fromDate, toDate) {
        return this._getFundHistory(symbol, fromDate, toDate);
    }

    _getFundHistory(symbol, fromDate, toDate) {
        let from = fromDate.toISOString();
        let fromAPIDate = this._encodeAPIDate(fromDate);
        let to = toDate.toISOString();
        let toAPIDate = this._encodeAPIDate(toDate);

        return new Promise((resolve, reject) => {
            request.post({
                url: API_URL_FUND_HISTORY,
                form: {
                    "symbol": symbol,
                    "od": fromAPIDate,
                    "do": toAPIDate,
                    "period": 0,
                    "format": "csv"
                }
            }, (err, response, history) => {
                if (err) {
                    return reject(err);
                }

                let meta = {symbol, from, to};
                let data = this._sanitizeFundHistory(symbol, history);

                resolve({meta, data});
            });
        });
    }

    _encodeAPIDate(date) {
        let yyyy = date.getFullYear();
        let mm = _.padLeft(date.getMonth() + 1, 2, "0");
        let dd = _.padLeft(date.getDate(), 2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }

    _sanitizeFundHistory(symbol, history) {
        let lines = history.split(/\r?\n/);
        lines.splice(0, 2);
        lines.splice(lines.length - 2, 2);

        let records = _.chain(lines)
            .map((line) => JSON.parse("[" + line + "]"))
            .map((line) => ({
                date: (new Date(line[0])).toISOString(),
                value: parseFloat(line[1].replace(",", ".")),
                shift: parseFloat(line[2].replace(",", "."))
            }))
            .sortBy((line) => line.date)
            .value();

        return {symbol, records};
    }
}

MoneyplApiClient.factory = () => new MoneyplApiClient();
MoneyplApiClient.factory.$inject = [];

export default MoneyplApiClient;
