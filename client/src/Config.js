const apiUrl = import.meta.env.VITE_API_URL || "https://asia-northeast1-url-shorten-dve-tw.cloudfunctions.net/url-shorten";
const rawBaseUrl = import.meta.env.VITE_BASE_URL || "https://dve.tw/";

export default {
  API_URL: apiUrl,
  BASE_URL: rawBaseUrl.endsWith("/") ? rawBaseUrl : `${rawBaseUrl}/`,
  reportBug() {
    // TODO: figure out better way to report bug
    window.location = "https://github.com/oToToT/shorten-url/issues";
  }
};
