import _ from "lodash";
import moment from "moment";

const RECENT_DURTION = moment.duration({months: 1});
const SEASON_DURTION = moment.duration({years: 1});

const RECENT_RISE_ALERT_RATIO = 0.1;
const RECENT_FALL_ALERT_RATIO = -0.1;
const SEASON_RISE_ALERT_RATIO = 0.15;
const SEASON_FALL_ALERT_RATIO = -0.15;

const VERDICT_RISE = "RISE";
const VERDICT_STILL = "STILL";
const VERDICT_FALL = "FALL";

class RefinanceAnalizer {
    getVerdictResult(historyResults, date) {
        let statsets = _.map(historyResults, (historyResult) => this._getRecordsStatset(historyResult.data.symbol, historyResult.data.records, date));
        let verdict = this._getStatsetsVerdict(statsets);

        let meta = {date: date.toISOString()};
        let data = {statsets, verdict};

        return {meta, data};
    }

    _getRecordsStatset(symbol, records, date) {
        let recentRecords = this._filterRecentRecords(records, date);
        let seasonRecords = this._filterSeasonRecords(records, date);

        let recent = this._getRecentRecordsStat(recentRecords);
        let season = this._getSeasonRecordsStat(seasonRecords);

        return {symbol, recent, season};
    }

    _filterRecentRecords(records, date) {
        return filterRecordsSpan(records, date, RECENT_DURTION);
    }

    _filterSeasonRecords(records, date) {
        return filterRecordsSpan(records, date, SEASON_DURTION);
    }

    _getRecentRecordsStat(records) {
        let keyRecords = this._evalRecentKeyRecords(records);
        let keyValues = this._evalRecentKeyValues(keyRecords);
        let ratios = this._evalRecentRatios(keyValues);
        let alerts = this._evalRecentAlerts(ratios);

        return {records, keyRecords, keyValues, ratios, alerts};
    }

    _getSeasonRecordsStat(records) {
        let keyRecords = this._evalSeasonKeyRecords(records);
        let keyValues = this._evalSeasonKeyValues(keyRecords);
        let ratios = this._evalSeasonRatios(keyValues);
        let alerts = this._evalSeasonAlerts(ratios);

        return {records, keyRecords, keyValues, ratios, alerts};
    }

    _evalRecentKeyRecords(records) {
        return {
            oldest: _.min(records, (record) => new Date(record.date)),
            newest: _.max(records, (record) => new Date(record.date))
        };
    }

    _evalSeasonKeyRecords(records) {
        return {
            oldest: _.min(records, (record) => new Date(record.date)),
            newest: _.max(records, (record) => new Date(record.date)),
            lowest: _.min(records, (record) => record.value),
            highest: _.max(records, (record) => record.value)
        };
    }

    _evalRecentKeyValues(keyRecords) {
        return {
            oldest: keyRecords.oldest.value,
            newest: keyRecords.newest.value
        };
    }

    _evalSeasonKeyValues(keyRecords) {
        return {
            oldest: keyRecords.oldest.value,
            newest: keyRecords.newest.value,
            lowest: keyRecords.lowest.value,
            highest: keyRecords.highest.value
        };
    }

    _evalRecentRatios(keyValues) {
        return {
            global: evalRatio(keyValues.newest, keyValues.oldest)
        };
    }

    _evalSeasonRatios(keyValues) {
        return {
            peakRise: evalRatio(keyValues.newest, keyValues.lowest),
            peakFall: evalRatio(keyValues.newest, keyValues.highest)
        };
    }

    _evalRecentAlerts(ratios) {
        return {
            globalRise: ratios.global > RECENT_RISE_ALERT_RATIO,
            globalFall: ratios.global < RECENT_FALL_ALERT_RATIO
        };
    }

    _evalSeasonAlerts(ratios) {
        return {
            peakRise: ratios.peakRise > SEASON_RISE_ALERT_RATIO,
            peakFall: ratios.peakFall < SEASON_FALL_ALERT_RATIO
        };
    }

    _getStatsetsVerdict(statsets) {
        let verdict = VERDICT_STILL;

        if (_.any(statsets, (statset) => statset.recent.alerts.globalRise) || _.any(statsets, (statset) => statset.season.alerts.peakRise)) {
            verdict = VERDICT_RISE;
        }
        if (_.any(statsets, (statset) => statset.recent.alerts.globalFall) || _.any(statsets, (statset) => statset.season.alerts.peakFall)) {
            verdict = VERDICT_FALL;
        }

        return verdict;
    }
}

RefinanceAnalizer.factory = () => new RefinanceAnalizer();
RefinanceAnalizer.factory.$inject = [];

function filterRecordsSpan(records, endDate, duration) {
    let toMoment = moment(endDate);
    let fromMoment = moment(endDate).subtract(duration);

    return _.filter(records, (record) => fromMoment.diff(record.date) <= 0 && toMoment.diff(record.date) >= 0);
}

function evalRatio(value, relativeValue) {
    return _.round((value - relativeValue) / relativeValue, 4);
}

export default RefinanceAnalizer;
