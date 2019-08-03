import { apiGet, apiPost } from './Api';

const url = "api/Payments/";

export function MakeMPESADonation(userID, amount, phoneNumber, isKES) {
  return apiGet(url + `MPESA/Send?userID=${userID}&amount=${amount}&phoneNumber=${phoneNumber}&isKES=${isKES}`);
}

export function CheckPaymentStatus(paymentID) {
  return apiGet(url + `MPESA/CheckStatus?paymentID=${paymentID}`);
}

export function LoadPaymentDetails(paymentID) {
  return apiGet(url + `MPESA/LoadPaymentDetails?paymentID=${paymentID}`);
}

export function ResendMPESADonation(userID, paymentID, amount, phoneNumber, isKES) {
  return apiGet(url + `MPESA/Resend?userID=${userID}&paymentID=${paymentID}&amount=${amount}&phoneNumber=${phoneNumber}&isKES=${isKES}`);
}