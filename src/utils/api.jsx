import axios from 'axios';

// railway url

// export const base_url = 'http://192.168.29.231:8443/api/v1/';

export const base_url = 'https://transectra.com:8443/api/v1/';

// export const base_url = 'http://192.168.0.199:8443/api/v1/';
// export const base_url = 'http://192.168.0.148:8443/api/v1/';

// export const base_url = 'https://preprod.transectra.com:8443/api/v1/';

//local
// export const base_url = 'http://192.168.0.148:8443/api/v1/';

export const fetchDataFromAPI = (url, method, data, token) =>
  new Promise((resolve, reject) => {
    // console.debug(
    //   "----------------APICAll(fetchDataFromAPI)------------------------"
    // );
    // console.log("Url", Base_URL + url);
    // console.log("method", method);
    // console.log("Body", body);
    // console.log("Token", token);

    var headers;

    if (token != null) {
      headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        type: 'admin',
      };
    } else {
      headers = {
        Accept: 'application/json',
        type: 'admin',
      };
    }
    if (data) {
      axios({
        method: method,
        baseURL: base_url + url,
        headers: headers,
        data: data,
      })
        .then((response) => {
          // When api send success response set in resolve method
          //   console.log("check main response",response)
          return resolve(response.data);
        })
        .catch((error) => {
          // When api send success response set in resolve method
          return reject(error);
        });
    } else {
      axios({
        method: method,
        baseURL: base_url + url,
        headers: headers,
      })
        .then((response) => {
          // When api send success response set in resolve method
          //   console.log("check main response",response)
          return resolve(response.data);
        })
        .catch((error) => {
          // When api send success response set in resolve method
          return reject(error);
        });
    }
  });
