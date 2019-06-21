import { apiGet, apiPost } from './Api';

const url = "api/Donate/";

export function GetItems(language, currency) {
  return apiGet(url + `GetItems?languageName=${language}&currencyCode=${currency}`);
}

export function AddItem() {
  return apiPost(url + "AddItem");
}

export function LoadImages() {
  return apiGet(url + "GetImages");
}