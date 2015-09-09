/*global describe, it*/

import chai from "chai";

import RefinanceAnalizer from "./refinance-analizer.js";

let expect = chai.expect;

describe("refinance-analizer", () => {
    let analizer = new RefinanceAnalizer();

    let sample1 = {
        symbol: "SYMBOL1",
        records: null,
        stat: {},
        verdict: null
    };
    sample1.records = [
        {date: new Date("2015-09-01"), value: 100},
        {date: new Date("2015-09-02"), value: 75},
        {date: new Date("2015-09-03"), value: 50},
        {date: new Date("2015-09-04"), value: 75},
        {date: new Date("2015-09-05"), value: 100},
        {date: new Date("2015-09-06"), value: 150},
        {date: new Date("2015-09-07"), value: 200},
        {date: new Date("2015-09-08"), value: 150},
        {date: new Date("2015-09-09"), value: 100},
        {date: new Date("2015-09-10"), value: 150}
    ];
    sample1.stat.symbol = sample1.symbol;
    sample1.stat.records = sample1.records;
    sample1.stat.keyRecords = {
        oldest: sample1.records[0],
        newest: sample1.records[9],
        lowest: sample1.records[2],
        highest: sample1.records[6]
    };
    sample1.stat.keyValues = {
        oldest: sample1.records[0].value,
        newest: sample1.records[9].value,
        lowest: sample1.records[2].value,
        highest: sample1.records[6].value
    };
    sample1.stat.ratios = {
        period: 0.50,
        peakGrowth: 2.00,
        peakDrop: -0.25
    };
    sample1.stat.alerts = {
        periodGrowth: true,
        periodDrop: false,
        peakGrowth: true,
        peakDrop: true
    };
    sample1.verdict = "FALL";

    let sample2 = {
        symbol: "SYMBOL2",
        records: null,
        stat: {},
        verdict: null
    };
    sample2.records = [
        sample1.records[4],
        sample1.records[5],
        sample1.records[6]
    ];
    sample2.stat.symbol = sample2.symbol;
    sample2.stat.records = sample2.records;
    sample2.stat.keyRecords = {
        oldest: sample1.records[4],
        newest: sample1.records[6],
        lowest: sample1.records[4],
        highest: sample1.records[6]
    };
    sample2.stat.keyValues = {
        oldest: sample1.records[4].value,
        newest: sample1.records[6].value,
        lowest: sample1.records[4].value,
        highest: sample1.records[6].value
    };
    sample2.stat.ratios = {
        period: 1.00,
        peakGrowth: 1.00,
        peakDrop: 0.00
    };
    sample2.stat.alerts = {
        periodGrowth: true,
        periodDrop: false,
        peakGrowth: true,
        peakDrop: false
    };
    sample2.verdict = "RISE";

    it("should evaluate stat key records", () => {
        let keyRecords;

        keyRecords = analizer._evalStatKeyRecords(sample1.records);
        expect(keyRecords).to.deep.equal(sample1.stat.keyRecords);

        keyRecords = analizer._evalStatKeyRecords(sample2.records);
        expect(keyRecords).to.deep.equal(sample2.stat.keyRecords);
    });

    it("should evaluate stat key values", () => {
        let keyValues;

        keyValues = analizer._evalStatKeyValues(sample1.stat.keyRecords);
        expect(keyValues).to.deep.equal(sample1.stat.keyValues);

        keyValues = analizer._evalStatKeyValues(sample2.stat.keyRecords);
        expect(keyValues).to.deep.equal(sample2.stat.keyValues);
    });

    it("should evaluate stat ratios", () => {
        let ratios;

        ratios = analizer._evalStatRatios(sample1.stat.keyValues);
        expect(ratios).to.deep.equal(sample1.stat.ratios);

        ratios = analizer._evalStatRatios(sample2.stat.keyValues);
        expect(ratios).to.deep.equal(sample2.stat.ratios);
    });

    it("should evaluate stat alerts", () => {
        let alerts;

        alerts = analizer._evalStatAlerts(sample1.stat.ratios);
        expect(alerts).to.deep.equal(sample1.stat.alerts);

        alerts = analizer._evalStatAlerts(sample2.stat.ratios);
        expect(alerts).to.deep.equal(sample2.stat.alerts);
    });

    it("should evaluate stat", () => {
        let stat;

        stat = analizer._getRecordsStat(sample1.symbol, sample1.records);
        expect(stat).to.deep.equal(sample1.stat);

        stat = analizer._getRecordsStat(sample2.symbol, sample2.records);
        expect(stat).to.deep.equal(sample2.stat);
    });

    it("should evaluate verdict", () => {
        let verdict;

        verdict = analizer._getStatsVerdict([sample1.stat]);
        expect(verdict).to.equal(sample1.verdict);

        verdict = analizer._getStatsVerdict([sample2.stat]);
        expect(verdict).to.equal(sample2.verdict);

        verdict = analizer._getStatsVerdict([sample1.stat, sample2.stat]);
        expect(verdict).to.equal(sample1.verdict);
    });
});
