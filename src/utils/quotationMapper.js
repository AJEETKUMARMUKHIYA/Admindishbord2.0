export const mapQuotationToViewModel = (apiData) => {
  return {
    bookingId: apiData.quotation.bookingID,
    quotationNumber: apiData.quotation.quotationNumber,
    customerName: apiData.quotation.customerName,
    email: apiData.quotation.email,
    phone: apiData.quotation.phoneNumber,
    pickupDate: apiData.quotation.pickupDate,
    slotTime: apiData.quotation.slotTime,
    fromAddress: apiData.quotation.fromAddress,
    toAddress: apiData.quotation.toAddress,
    totalAmount: apiData.quotation.totalAmount,
    totalVolume: apiData.quotation.totalVolume,
    movingType: apiData.quotation.movingType,
    items: apiData.items.map(i => ({
      name: i.itemName,
      quantity: i.bookedQuantity,
      category: i.category,
      size: i.sizeCFT
    }))
  };
};
