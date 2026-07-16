import axios from "../AxiosClient";

export const getQuotationByNumber = async (quotationNumber) => {
  const response = await axios.get(
    `/Dashboard/quotation/${quotationNumber}`
  );

  return response.data;
};
