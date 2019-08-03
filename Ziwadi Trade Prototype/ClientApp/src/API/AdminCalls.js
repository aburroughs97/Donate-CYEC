import { apiGet, apiPost } from './Api';

const url = "api/Admin/";

export function GetAllUsers() {
  return apiGet(url + "GetAllUsers");
}

export function MakeUserAdmin(userID) {
  return apiGet(url + `MakeUserAdmin?userID=${userID}`)
}

export function AddItem(request) {
  return apiPost(url + 'AddItem', request);
}

export function GetItemData(itemID) {
  return apiGet(url + `GetItemData?itemID=${itemID}`);
}

export function UpdateItem(itemData) {
  return apiPost(url + "UpdateItem", itemData);
}

export function GetDropOffDonations() {
  return apiGet(url + "GetDropOffDonations");
}

export function MarkAsDelivered(donationID) {
  return apiGet(url + `MarkAsDelivered?donationID=${donationID}`);
}

export function GetPaymentDonations() {
  return apiGet(url + "GetPaymentDonations");
}

export function MarkAsPurchased(donationID) {
  return apiGet(url + `MarkAsPurchased?donationID=${donationID}`);
}