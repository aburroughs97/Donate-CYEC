import { apiGet } from './Api';

const url = "api/Account/";

export function GetUser(userID) {
  return apiGet(url + `GetUser?userID=${userID}`);
}

export function UpdateUser(userID, firstName, lastName) {
  return apiGet(url + `UpdateUser?userID=${userID}&firstName=${firstName}&lastName=${lastName}`);
}

export function ChangePassword(userID, currentPassword, newPassword) {
  return apiGet(url + `ChangePassword?userID=${userID}&currentPassword=${currentPassword}&newPassword=${newPassword}`);
}

export function UpdateLanguageAndCurrency(userID, language, currency) {
  return apiGet(url + `UpdateLanguageAndCurrency?userID=${userID}&languageName=${language}&currencyCode=${currency}`);
}

export function GetLanguages() {
  return apiGet(url + "GetLanguages");
}

export function GetCurrencies() {
  return apiGet(url + "GetCurrencies");
}

export function GetRecentDonations(userID, language, currency) {
  return apiGet(url + `GetRecentDonations?userID=${userID}&languageName=${language}&currencyCode=${currency}`)
}