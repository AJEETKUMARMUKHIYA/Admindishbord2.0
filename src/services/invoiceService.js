import axios from "../AxiosClient";

/* ===============================
   GENERATE INVOICE
================================ */
export const generateInvoiceByQuotation = async (quotationNumber) => {
  const response = await axios.post(
    `/Invoice/generate`,
    null,
    {
      params: { quotationNumber }
    }
  );

  return response.data;
};


/* ===============================
   GET INVOICE BY QUOTATION
================================ */
export const getInvoiceDetails = async (invoiceNumber) => {
  try {
    if (!invoiceNumber) {
      throw new Error("Invoice number is required");
    }

    const response = await axios.get(
      `/Invoice/details`,
      {
        params: { invoiceNumber }
      }
    );

    return response.data;

  } catch (error) {
    console.error(
      "Get Invoice Details Error:",
      error.response?.data || error.message
    );
    throw error.response?.data || { message: "Failed to fetch invoice details" };
  }
};

