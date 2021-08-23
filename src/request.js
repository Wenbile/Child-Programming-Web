import Axios from 'axios';

export default {
    async callApi(method, url, data) {
        method = method.toUpperCase();
        let config = {
            method: method,
            url: url,
        };
        method === 'GET' ? config.params = data : config.data = data;
        let resp = await Axios(config);
        return resp.data;
    }
}
