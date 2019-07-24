import { apiGet, apiPost } from './Api';

const url = "api/Donate/";

export function GetItems(language, currency) {
  return apiGet(url + `GetItems?languageName=${language}&currencyCode=${currency}`);
}

export function GetItem(itemID, language, currency) {
  return apiGet(url + `GetItem?itemID=${itemID}&languageName=${language}&currencyCode=${currency}`);
}

export function AddItem() {
  return apiPost(url + "AddItem");
}

export function AddImages() {
  return apiPost(url + "AddImage");
}

export function LoadCart(userID, language, currency) {
  return apiGet(url + `LoadCart?userID=${userID}&languageName=${language}&currencyCode=${currency}`);
}

export function CheckCart(userID) {
  return apiGet(url + `CheckCart?userID=${userID}`);
}

export function AddToCart(userID, itemID, totalAmount, numItems) {
  return apiGet(url + `AddToCart?userID=${userID}&itemID=${itemID}&totalAmount=${totalAmount}&numItems=${numItems}`);
}

export function UpdateCartItem(item) {
  return apiPost(url + 'UpdateCartItem', item);
}

export function RemoveCartItem(userID, itemID) {
  return apiGet(url + `RemoveCartItem?userID=${userID}&itemID=${itemID}`)
}

export function MakeDropOffDonation(userID, date) {
  return apiGet(url + `MakeDropOffDonation?userID=${userID}&deliveryDate=${date.toISOString()}`);
}

export function FixItems() {
  return apiGet(url + "FixItems");
}