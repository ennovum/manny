import config from "./../../config/config.js";

class RefinanceClient {
    constructor($http) {
        this._$http = $http;
    }

    getVerdict(endDate, seasonDate) {
        return this._$http.get(
            config.api.baseUrl + config.api.resources.refinance.verdict,
            {
                params: {
                    "end-date": endDate.toISOString(),
                    "season-date": seasonDate.toISOString()
                }
            })
            .then((response) => response.data);
    }
}

RefinanceClient.service = ($http) => new RefinanceClient($http);
RefinanceClient.service.$inject = ["$http"];

export default RefinanceClient;
