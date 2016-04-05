/*global describe, it*/

import moment from "moment";
import chai from "chai";

import RefinanceAnalizer from "./refinance-analizer.js";
import {filterRecordsSpan, evalRatio} from "./refinance-analizer.js";

let expect = chai.expect;

describe("RefinanceAnalizer", () => {
    let analizer = new RefinanceAnalizer();

    let sample1 = {
        symbol: "SAMPLE1",
        records: [
            {date: new Date("2013-01-01"), value: 0},
            {date: new Date("2014-01-01"), value: 200},
            {date: new Date("2015-01-01"), value: 100},
            {date: new Date("2015-03-01"), value: 95},
            {date: new Date("2015-05-01"), value: 100},
            {date: new Date("2015-07-01"), value: 105},
            {date: new Date("2015-08-01"), value: 100},
            {date: new Date("2015-08-11"), value: 101},
            {date: new Date("2015-08-21"), value: 99},
            {date: new Date("2015-09-01"), value: 100}
        ],
        date: new Date("2015-09-01")
    };

    sample1.recentRecords = [
        sample1.records[6],
        sample1.records[7],
        sample1.records[8],
        sample1.records[9]
    ];

    sample1.seasonRecords = [
        sample1.records[2],
        sample1.records[3],
        sample1.records[4],
        sample1.records[5],
        sample1.records[6],
        sample1.records[7],
        sample1.records[8],
        sample1.records[9]
    ];

    sample1.recentKeyRecords = {
        oldest: sample1.records[6],
        newest: sample1.records[9]
    };

    sample1.seasonKeyRecords = {
        oldest: sample1.records[2],
        newest: sample1.records[9],
        lowest: sample1.records[3],
        highest: sample1.records[5]
    };

    sample1.recentKeyValues = {
        oldest: sample1.records[6].value, // 100
        newest: sample1.records[9].value // 100
    };

    sample1.seasonKeyValues = {
        oldest: sample1.records[2].value, // 100
        newest: sample1.records[9].value, // 100
        lowest: sample1.records[3].value, // 95
        highest: sample1.records[5].value // 105
    };

    sample1.recentRatios = {
        global: 0
    };

    sample1.seasonRatios = {
        peakRise: 0.0526,
        peakFall: -0.0476
    };

    sample1.recentAlerts = {
        globalRise: false,
        globalFall: false
    };

    sample1.seasonAlerts = {
        peakRise: false,
        peakFall: false
    };

    sample1.recentStat = {
        records: sample1.recentRecords,
        keyRecords: sample1.recentKeyRecords,
        keyValues: sample1.recentKeyValues,
        ratios: sample1.recentRatios,
        alerts: sample1.recentAlerts
    };

    sample1.seasonStat = {
        records: sample1.seasonRecords,
        keyRecords: sample1.seasonKeyRecords,
        keyValues: sample1.seasonKeyValues,
        ratios: sample1.seasonRatios,
        alerts: sample1.seasonAlerts
    };

    sample1.statset = {
        symbol: sample1.symbol,
        recent: sample1.recentStat,
        season: sample1.seasonStat
    };

    sample1.statsets = [
        sample1.statset
    ];

    sample1.verdict = "STILL";

    let sample2 = {
        statsets: [
            {
                recent: {
                    alerts: {
                        globalRise: false,
                        globalFall: true
                    }
                },
                season: {
                    alerts: {
                        peakRise: false,
                        peakFall: false
                    }
                }
            },
            {
                recent: {
                    alerts: {
                        globalRise: false,
                        globalFall: false
                    }
                },
                season: {
                    alerts: {
                        peakRise: true,
                        peakFall: false
                    }
                }
            }
        ]
    };

    sample2.verdict = "FALL";

    it("should get statset", () => {
        let statset = analizer._getRecordsStatset(sample1.symbol, sample1.records, sample1.date);
        expect(statset).to.deep.equal(sample1.statset);
    });

    it("should filter recent records", () => {
        let recentRecords = analizer._filterRecentRecords(sample1.records, sample1.date);
        expect(recentRecords).to.deep.equal(sample1.recentRecords);
    });

    it("should filter season records", () => {
        let seasonRecords = analizer._filterSeasonRecords(sample1.records, sample1.date);
        expect(seasonRecords).to.deep.equal(sample1.seasonRecords);
    });

    it("should get recent stat", () => {
        let recentStat = analizer._getRecentRecordsStat(sample1.recentRecords);
        expect(recentStat).to.deep.equal(sample1.recentStat);
    });

    it("should get season stat", () => {
        let seasonStat = analizer._getSeasonRecordsStat(sample1.seasonRecords);
        expect(seasonStat).to.deep.equal(sample1.seasonStat);
    });

    it("should eval recent key records", () => {
        let recentKeyRecords = analizer._evalRecentKeyRecords(sample1.recentRecords);
        expect(recentKeyRecords).to.deep.equal(sample1.recentKeyRecords);
    });

    it("should eval season key records", () => {
        let seasonKeyRecords = analizer._evalSeasonKeyRecords(sample1.seasonRecords);
        expect(seasonKeyRecords).to.deep.equal(sample1.seasonKeyRecords);
    });

    it("should eval recent key values", () => {
        let recentKeyValues = analizer._evalRecentKeyValues(sample1.recentKeyRecords);
        expect(recentKeyValues).to.deep.equal(sample1.recentKeyValues);
    });

    it("should eval season key values", () => {
        let seasonKeyValues = analizer._evalSeasonKeyValues(sample1.seasonKeyRecords);
        expect(seasonKeyValues).to.deep.equal(sample1.seasonKeyValues);
    });

    it("should eval recent ratios", () => {
        let recentRatios = analizer._evalRecentRatios(sample1.recentKeyValues);
        expect(recentRatios).to.deep.equal(sample1.recentRatios);
    });

    it("should eval season ratios", () => {
        let seasonRatios = analizer._evalSeasonRatios(sample1.seasonKeyValues);
        expect(seasonRatios).to.deep.equal(sample1.seasonRatios);
    });

    it("should eval recent alerts", () => {
        let recentAlerts = analizer._evalRecentAlerts(sample1.recentRatios);
        expect(recentAlerts).to.deep.equal(sample1.recentAlerts);
    });

    it("should eval season alerts", () => {
        let seasonAlerts = analizer._evalSeasonAlerts(sample1.seasonRatios);
        expect(seasonAlerts).to.deep.equal(sample1.seasonAlerts);
    });

    it("should get statsets verdict", () => {
        let verdict;

        verdict = analizer._getStatsetsVerdict(sample1.statsets);
        expect(verdict).to.deep.equal(sample1.verdict);

        verdict = analizer._getStatsetsVerdict(sample2.statsets);
        expect(verdict).to.deep.equal(sample2.verdict);
    });
});

describe("filterRecordsSpan", () => {
    let sample1 = {
        records: [
            {date: new Date("2013-01-01"), value: 0},
            {date: new Date("2014-01-01"), value: 200},
            {date: new Date("2015-01-01"), value: 100},
            {date: new Date("2015-03-01"), value: 95},
            {date: new Date("2015-05-01"), value: 100},
            {date: new Date("2015-07-01"), value: 105},
            {date: new Date("2015-08-01"), value: 100},
            {date: new Date("2015-08-11"), value: 101},
            {date: new Date("2015-08-21"), value: 99},
            {date: new Date("2015-09-01"), value: 100}
        ],
        endDate: new Date("2015-09-01"),
        duration: moment.duration({months: 1})
    };

    sample1.filteredRecords = [
        sample1.records[6],
        sample1.records[7],
        sample1.records[8],
        sample1.records[9]
    ];

    let sample2 = {
        records: sample1.records,
        endDate: new Date("2015-07-01"),
        duration: moment.duration({years: 1})
    };

    sample2.filteredRecords = [
        sample1.records[2],
        sample1.records[3],
        sample1.records[4],
        sample1.records[5]
    ];

    it("should filter records span", () => {
        let filteredRecords;

        filteredRecords = filterRecordsSpan(sample1.records, sample1.endDate, sample1.duration);
        expect(filteredRecords).to.deep.equal(sample1.filteredRecords);

        filteredRecords = filterRecordsSpan(sample2.records, sample2.endDate, sample2.duration);
        expect(filteredRecords).to.deep.equal(sample2.filteredRecords);
    });
});

describe("evalRatio", () => {
    let sample1 = {
        value: 100,
        relativeValue: 100
    };

    sample1.ratio = 0;

    let sample2 = {
        value: 100,
        relativeValue: 50
    };

    sample2.ratio = 1;

    let sample3 = {
        value: 100,
        relativeValue: 200
    };

    sample3.ratio = -0.5;

    it("should eval ratio", () => {
        let ratio;

        ratio = evalRatio(sample1.value, sample1.relativeValue);
        expect(ratio).to.equal(sample1.ratio);

        ratio = evalRatio(sample2.value, sample2.relativeValue);
        expect(ratio).to.equal(sample2.ratio);

        ratio = evalRatio(sample3.value, sample3.relativeValue);
        expect(ratio).to.equal(sample3.ratio);
    });
});