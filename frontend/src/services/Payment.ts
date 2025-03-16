const API_URL_METHOD = "http://localhost:3001/api/payments";
const getAllPaymentMethods = async () => {
  try {
    const response = await fetch(API_URL_METHOD);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Lỗi khi fetch dữ liệu:", error);
  }
};
const PaymentServices = {
    getAllPaymentMethods
  };
  export default PaymentServices;