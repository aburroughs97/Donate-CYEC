import apiPost from './Api';

const url = "api/Account/";

export function LogIn(data) {
  return apiPost(url + "LogIn", data)
};

export function CreateAccount(data) {
  return apiPost(url + "CreateAccount", data)
}

export function ValidateAccessToken(userID, accessToken) {
  return apiPost(url + "ValidateAccessToken", {userID, accessToken})
};

export function RemoveAccessToken(userAccessToken) {
  return apiPost(url + "RemoveAccessToken", userAccessToken)
};

export function CreateAccessToken(userID) {
  return apiPost(url + "CreateAccessToken", userID)
};

export function SendForgotPasswordEmail(email) {
  return apiPost(url + "SendForgotPasswordEmail", email)
}

export function ValidateForgotPasswordToken(email, token) {
  return apiPost(url + "ValidateForgotPasswordToken", {email, token})
}
