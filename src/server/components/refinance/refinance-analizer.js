import _ from "lodash";

const VERDICT_RISE = "RISE";
const VERDICT_STILL = "STILL";
const VERDICT_FALL = "FALL";

const PERIOD_GROWTH_ALERT_THRESHOLD = 0.1;
const PERIOD_DROP_ALERT_THRESHOLD = -0.1;
const PEAK_GROWTH_ALERT_THRESHOLD = 0.15;
const PEAK_DROP_ALERT_THRESHOLD = -0.15;

class RefinanceAnalizer {
    getVerdictResult(historyResults) {
        let stats = _.map(historyResults, (historyResult) => this._getRecordsStat(historyResult.data.symbol, historyResult.data.records));
        let verdict = this._getStatsVerdict(stats);

        let meta = {};
        let data = {stats, verdict};

        return {meta, data};
    }

    _getRecordsStat(symbol, records) {
        let keyRecords = this._evalStatKeyRecords(records);
        let keyValues = this._evalStatKeyValues(keyRecords);
        let ratios = this._evalStatRatios(keyValues);
        let alerts = this._evalStatAlerts(ratios);

        return {symbol, records, keyRecords, keyValues, ratios, alerts};
    }

    _getStatsVerdict(stats) {
        let verdict = VERDICT_STILL;

        if (_.any(stats, (stat) => stat.alerts.periodGrowth) || _.any(stats, (stat) => stat.alerts.peakGrowth)) {
            verdict = VERDICT_RISE;
        }
        if (_.any(stats, (stat) => stat.alerts.periodDrop) || _.any(stats, (stat) => stat.alerts.peakDrop)) {
            verdict = VERDICT_FALL;
        }

        return verdict;
    }

    _evalStatKeyRecords(statRecords) {
        return {
            oldest: _.min(statRecords, (record) => new Date(record.date)),
            newest: _.max(statRecords, (record) => new Date(record.date)),
            lowest: _.min(statRecords, (record) => record.value),
            highest: _.max(statRecords, (record) => record.value)
        };
    }

    _evalStatKeyValues(statKeyRecords) {
        return {
            oldest: statKeyRecords.oldest.value,
            newest: statKeyRecords.newest.value,
            lowest: statKeyRecords.lowest.value,
            highest: statKeyRecords.highest.value
        };
    }

    _evalStatRatios(statKeyValues) {
        return {
            period: this._evalValuesRatio(statKeyValues.newest, statKeyValues.oldest),
            peakGrowth: this._evalValuesRatio(statKeyValues.newest, statKeyValues.lowest),
            peakDrop: this._evalValuesRatio(statKeyValues.newest, statKeyValues.highest)
        };
    }

    _evalStatAlerts(statRatios) {
        return {
            periodGrowth: statRatios.period > PERIOD_GROWTH_ALERT_THRESHOLD,
            periodDrop: statRatios.period < PERIOD_DROP_ALERT_THRESHOLD,
            peakGrowth: statRatios.peakGrowth > PEAK_GROWTH_ALERT_THRESHOLD,
            peakDrop: statRatios.peakDrop < PEAK_DROP_ALERT_THRESHOLD
        };
    }

    _evalValuesRatio(value, relativeValue) {
        return _.round((value - relativeValue) / relativeValue, 4);
    }
}

RefinanceAnalizer.factory = () => new RefinanceAnalizer();
RefinanceAnalizer.factory.$inject = [];

export default RefinanceAnalizer;
