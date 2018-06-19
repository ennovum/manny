import _ from "lodash";
import moment from "moment";

const RECENT_RISE_ALERT_RATIO = 0.1;
const RECENT_FALL_ALERT_RATIO = -0.1;
const SEASON_RISE_ALERT_RATIO = 0.15;
const SEASON_FALL_ALERT_RATIO = -0.15;

const VERDICT_RISE = "RISE";
const VERDICT_STILL = "STILL";
const VERDICT_FALL = "FALL";

export default class RefinanceAnalizer {
    getVerdictResult(historyResults, endDate, recentDate, seasonDate) {
        let statsets = _.map(historyResults, (historyResult) => this._getRecordsStatset(historyResult.data.symbol, historyResult.data.records, endDate, recentDate, seasonDate));
        let verdict = this._getStatsetsVerdict(statsets);

        let meta = {endDate: endDate.toISOString(), recentDate: recentDate.toISOString(), seasonDate: seasonDate.toISOString()};
        let data = {statsets, verdict};

        return {meta, data};
    }

    _getRecordsStatset(symbol, records, endDate, recentDate, seasonDate) {
        let recentRecords = this._filterRecentRecords(records, endDate, recentDate);
        let seasonRecords = this._filterSeasonRecords(records, endDate, seasonDate);

        let recent = this._getRecentRecordsStat(recentRecords);
        let season = this._getSeasonRecordsStat(seasonRecords);

        return {symbol, recent, season};
    }

    _filterRecentRecords(records, endDate, recentDate) {
        let endMoment = moment(endDate);
        let recentMoment = moment(recentDate);
        return _.filter(records, (record) => !endMoment.isBefore(record.date) && !recentMoment.isAfter(record.date));
    }

    _filterSeasonRecords(records, endDate, seasonDate) {
        let endMoment = moment(endDate);
        let seasonMoment = moment(seasonDate);
        return _.filter(records, (record) => !endMoment.isBefore(record.date) && !seasonMoment.isAfter(record.date));
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
        let oldest = _.min(records, (record) => new Date(record.date));
        let newest = _.max(records, (record) => new Date(record.date));

        return {oldest, newest};
    }

    _evalSeasonKeyRecords(records) {
        let newest = _.max(records, (record) => new Date(record.date));
        let lowest = _.min(records, (record) => record.value);
        let highest = _.max(records, (record) => record.value);

        return {newest, lowest, highest};
    }

    _evalRecentKeyValues(keyRecords) {
        let oldest = keyRecords.oldest.value;
        let newest = keyRecords.newest.value;

        return {oldest, newest};
    }

    _evalSeasonKeyValues(keyRecords) {
        let newest = keyRecords.newest.value;
        let lowest = keyRecords.lowest.value;
        let highest = keyRecords.highest.value;

        return {newest, lowest, highest};
    }

    _evalRecentRatios(keyValues) {
        let global = evalRatio(keyValues.newest, keyValues.oldest);

        return {global};
    }

    _evalSeasonRatios(keyValues) {
        let peakRise = evalRatio(keyValues.newest, keyValues.lowest);
        let peakFall = evalRatio(keyValues.newest, keyValues.highest);

        return {peakRise, peakFall};
    }

    _evalRecentAlerts(ratios) {
        let globalRise = ratios.global > RECENT_RISE_ALERT_RATIO;
        let globalFall = ratios.global < RECENT_FALL_ALERT_RATIO;

        return {globalRise, globalFall};
    }

    _evalSeasonAlerts(ratios) {
        let peakRise = ratios.peakRise > SEASON_RISE_ALERT_RATIO;
        let peakFall = ratios.peakFall < SEASON_FALL_ALERT_RATIO;

        return {peakRise, peakFall};
    }

    _getStatsetsVerdict(statsets) {
        let verdict = VERDICT_STILL;

        let anyGlobalRise = _.any(statsets, (statset) => statset.recent.alerts.globalRise);
        let anyGlobalFall = _.any(statsets, (statset) => statset.recent.alerts.globalFall);
        let anyPeakRise = _.any(statsets, (statset) => statset.season.alerts.peakRise);
        let anyPeakFall = _.any(statsets, (statset) => statset.season.alerts.peakFall);

        if (anyGlobalRise || anyPeakRise) {
            verdict = VERDICT_RISE;
        }
        if (anyGlobalFall || anyPeakFall) {
            verdict = VERDICT_FALL;
        }

        return verdict;
    }
}

RefinanceAnalizer.factory = () => new RefinanceAnalizer();
RefinanceAnalizer.factory.$inject = [];

export function evalRatio(value, relativeValue) {
    return _.round((value - relativeValue) / relativeValue, 4);
}
