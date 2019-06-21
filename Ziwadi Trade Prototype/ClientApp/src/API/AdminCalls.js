import { apiGet } from './Api';

const url = "api/Admin/";

export function GetAllUsers() {
  return apiGet(url + "GetAllUsers");
}

export function MakeUserAdmin(userID) {
  return apiGet(url + `MakeUserAdmin?userID=${userID}`)
}
