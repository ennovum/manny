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
        let stats = _.map(historyResults, (historyResult) => this._getRecordsStat(historyResult.data.records));
        let verdict = this._getStatsVerdict(stats);

        let meta = {};
        let data = {stats, verdict};

        return {meta, data};
    }

    _getRecordsStat(records) {
        let oldestRecord = _.min(records, (record) => new Date(record.date));
        let newestRecord = _.max(records, (record) => new Date(record.date));
        let lowestRecord = _.min(records, (record) => record.value);
        let highestRecord = _.max(records, (record) => record.value);

        let oldestValue = oldestRecord.value;
        let newestValue = newestRecord.value;
        let lowestValue = lowestRecord.value;
        let highestValue = highestRecord.value;

        let periodRatio = 1 - (oldestValue / newestValue);
        let peakGrowthRatio = 1 - (lowestValue / newestValue);
        let peakDropRatio = 1 - (highestValue / newestValue);

        let periodGrowthAlert = periodRatio > PERIOD_GROWTH_ALERT_THRESHOLD;
        let periodDropAlert = periodRatio < PERIOD_DROP_ALERT_THRESHOLD;
        let peakGrowthAlert = peakGrowthRatio > PEAK_GROWTH_ALERT_THRESHOLD;
        let peakDropAlert = peakDropRatio < PEAK_DROP_ALERT_THRESHOLD;

        return {
            records,
            oldestValue, newestValue, lowestValue, highestValue,
            periodRatio, peakGrowthRatio, peakDropRatio,
            periodGrowthAlert, periodDropAlert, peakGrowthAlert, peakDropAlert
        };
    }

    _getStatsVerdict(stats) {
        let verdict = VERDICT_STILL;

        if (_.any(stats, (stat) => stat.periodGrowthAlert) || _.any(stats, (stat) => stat.peakGrowthAlert)) {
            verdict = VERDICT_RISE;
        }
        if (_.any(stats, (stat) => stat.periodDropAlert) || _.any(stats, (stat) => stat.peakDropAlert)) {
            verdict = VERDICT_FALL;
        }

        return verdict;
    }
}

RefinanceAnalizer.factory = () => new RefinanceAnalizer();
RefinanceAnalizer.factory.$inject = [];

export default RefinanceAnalizer;
