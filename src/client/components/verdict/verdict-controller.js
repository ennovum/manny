import moment from "moment";

const DATE_FORMAT = "YYYY-MM-DD";

class VerdictController {
    constructor(refinanceClient) {
        this._refinanceClient = refinanceClient;

        this.verdict = null;
        this.model = {
            endDate: null,
            seasonDate: null
        };

        this._initModel();
    }

    _initModel() {
        let nowMoment = moment();
        let seasonMoment = moment().subtract(1, "years");

        this.model.endDate = nowMoment.format(DATE_FORMAT);
        this.model.seasonDate = seasonMoment.format(DATE_FORMAT);
    }

    getVerdict() {
        let endDate = moment(this.model.endDate, DATE_FORMAT).toDate();
        let seasonDate = moment(this.model.seasonDate, DATE_FORMAT).toDate();

        this._refinanceClient.getVerdict(endDate, seasonDate)
            .then((result) => {
                this.verdict = result.data;
            })
            .catch(() => {
                // TODO error handling
            });
    }
}

VerdictController.controller = (refinanceClient) => new VerdictController(refinanceClient);
VerdictController.controller.$inject = ["refinanceClient"];

export default VerdictController;
