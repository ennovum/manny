class VerdictController {
    constructor(refinanceClient) {
        this._refinanceClient = refinanceClient;

        this.verdict = null;

        this.getVerdict(new Date());
    }

    getVerdict(date) {
        this._refinanceClient.getVerdict(date)
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
