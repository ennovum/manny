import _ from "lodash";
import request from "request";

const API_FUND_HISTORY_URL = "http://www.money.pl/fundusze/archiwum/fundusze/";
const API_FUND_HISTORY_PERIOD_DAYS_LIMIT = 50;

class MoneyplApiClient {
    getFundHistoryResult(symbol, fromDate, toDate) {
        let from = fromDate.toISOString();
        let to = toDate.toISOString();
        let meta = {symbol, from, to};

        return this._requestFundHistory(symbol, fromDate, toDate)
            .then((data) => ({meta, data}));
    }

    _requestFundHistory(symbol, fromDate, toDate) {
        let partPeriods = this._evalFundHistoryPartPeriods(fromDate, toDate);

        return Promise.all(_.map(partPeriods, (partPeriod) => this._requestFundHistoryPart(symbol, partPeriod.fromDate, partPeriod.toDate)))
            .then((parts) => ({
                symbol: parts[0].symbol,
                records: _.reduce(parts, (data, part) => data.concat(part.records), [])
            }));
    }

    _evalFundHistoryPartPeriods(fromDate, toDate) {
        let partPeriods = [];
        let periodDate;
        let limitDate;

        while (!limitDate || limitDate < toDate) {
            periodDate = limitDate ? new Date(limitDate.getFullYear(), limitDate.getMonth(), limitDate.getDate() + 1) : fromDate;
            limitDate = new Date(periodDate.getFullYear(), periodDate.getMonth(), periodDate.getDate() + API_FUND_HISTORY_PERIOD_DAYS_LIMIT);

            partPeriods.push({
                fromDate: periodDate,
                toDate: limitDate < toDate ? limitDate : toDate
            });
        }

        return partPeriods;
    }

    _requestFundHistoryPart(symbol, fromDate, toDate) {
        return new Promise((resolve, reject) => {
            request.post({
                url: API_FUND_HISTORY_URL,
                form: {
                    "symbol": symbol,
                    "od": this._encodeAPIDate(fromDate),
                    "do": this._encodeAPIDate(toDate),
                    "period": 0,
                    "format": "csv"
                }
            }, (err, response, data) => {
                if (err) {
                    return reject(err);
                }

                resolve(this._sanitizeFundHistory(symbol, data));
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
                value: _.round(parseFloat(line[1].replace(",", ".")), 2),
                ratio: _.round(parseFloat(line[2].replace(",", ".")) / 100, 4)
            }))
            .sortBy((line) => line.date)
            .value();

        return {symbol, records};
    }
}

MoneyplApiClient.factory = () => new MoneyplApiClient();
MoneyplApiClient.factory.$inject = [];

export default MoneyplApiClient;
