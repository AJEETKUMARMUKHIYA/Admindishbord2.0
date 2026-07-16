import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import signature from "../assets/signature.png";


export const generateGoodsConsignmentPDF = async(bookingData) => {

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // dd/mm/yyyy
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-GB"); // dd/mm/yyyy
  };

  const loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = () => reject(new Error("Image load failed"));
    });
  };

  const doc = new jsPDF("p", "mm", "a4");

  const PAGE_WIDTH = doc.internal.pageSize.width;
  const PAGE_HEIGHT = doc.internal.pageSize.height;

  const margin = 15;
  const CONTENT_WIDTH = 180;
  const FOOTER_HEIGHT = 50;
  const SAFE_BOTTOM = PAGE_HEIGHT - FOOTER_HEIGHT - 10;
  const TOP_MARGIN = 20;

  let y = margin;

  /* ===== UNIVERSAL PAGE BREAK FUNCTION (SAFE) ===== */
  const addTextWithPageBreak = (text, startY, lineGap = 6) => {
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH);

    lines.forEach((line) => {
      if (startY + lineGap > SAFE_BOTTOM) {
        doc.addPage();
        startY = TOP_MARGIN;
      }
      doc.text(line, margin, startY);
      startY += lineGap;
    });

    return startY + 2;
  };

  /* ================= HEADER ================= */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PACKYATRA RELOCATION PRIVATE LIMITED", PAGE_WIDTH / 2, y, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  y += 5;
  doc.text(
    "C/O DEVEERAMMA 122, 4TH MAIN, WCR, MANJUNATHA NAGAR BANGALORE NORTH INDUSTRIAL ESTATE BANGALORE-560010 KARNATAKA",
    PAGE_WIDTH / 2,
    y,
    { align: "center", maxWidth: 180 }
  );

  y += 8;
  doc.text(
    "GSTIN : 29AAQCP3437K1ZR (KARNATAKA), CIN: U68100KA2025PTC210677, PAN: AAQCP3437K",
    PAGE_WIDTH / 2,
    y,
    { align: "center" }
  );

  y += 6;
  doc.text("www.packyatra.com    Ph No: 9071 535 535", PAGE_WIDTH / 2, y, { align: "center" });

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("GOODS CONSIGNMENT NOTE", PAGE_WIDTH / 2, y, { align: "center" });

  y += 6;

  /* ================= CONSIGNOR / CONSIGNEE ================= */
  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2 },
    body: [
      ["Consigner Name: " + (bookingData.invoice.customerName || "N/A"), "Consignee Name: " + (bookingData.invoice.customerName || "N/A")],
      ["Pickup Address: " + (bookingData.invoice.fromAddress || "N/A"), "Delivery Address: " + (bookingData.invoice.toAddress || "N/A")],
      ["Phone No: " + (bookingData.invoice.phoneNumber || "N/A"), "Phone No: " + (bookingData.invoice.phoneNumber || "N/A")],
      ["Email ID: " + (bookingData.invoice.email || "N/A"), "Email ID: " + (bookingData.invoice.email || "N/A")]
    ]
  });

  y = doc.lastAutoTable.finalY + 4;

  /* ================= BOOKING DETAILS ================= */
  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2 },
    body: [
      ["GC Number ",  bookingData.invoice.invoiceNumber, "Quotation No ", bookingData.invoice.quotationNumber || "N/A"],
      ["Vehicle Type ", "_", "Vehicle Reg No: ", "_"],
      ["Pickup Date ", formatDate(bookingData.invoice.pickupDate) || "N/A", "Total Packages ", "_"],
      ["Goods Value  ", "_", "Payment Type ", "Partial"],
      ["Consignment Type ", "By Road", "Gross Weight / Volume ", bookingData.invoice.totalVolume ? bookingData.invoice.totalVolume + " CFT" : "_"],
      ["Booking Amount(INR) ", bookingData.invoice.totalAmount || "N/A", "SAC ", "996511"]
    ]
  });

  y = doc.lastAutoTable.finalY + 10;

  /* ================= CUSTOMER DECLARATION ================= */
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER DECLARATION:", margin, y);

  doc.setFont("helvetica", "normal");
  y += 8;

  const declarationText =
    "I acknowledge that, I have read and understood all the terms and conditions mentioned on this consignment note, on both the front and overleaf, and I accept them for this contract carriage.";

  y = addTextWithPageBreak(declarationText, y);

  y += 5;

  /* ================= DELIVERY OPTIONS (WITH VISIBLE CHECKBOX) ================= */

// Page break safety (important for long content)
if (y + 20 > SAFE_BOTTOM) {
  doc.addPage();
  y = TOP_MARGIN;
}

doc.setFont("helvetica", "bold");
doc.setFontSize(10);

// Delivery Row
doc.text("Delivery:", 15, y);

// Door Delivery checkbox
doc.rect(45, y - 4, 6, 6);
doc.setFont("helvetica", "normal");
doc.text("Door Delivery", 55, y);

// Godown Delivery checkbox
doc.rect(110, y - 4, 6, 6);
doc.text("Godown Delivery", 120, y);

// Generated Date (right aligned like your design)
doc.setFont("helvetica", "bold");
doc.text("Generated Date:", 150, y);

doc.setFont("helvetica", "normal");
//doc.rect(185, y - 4, 25, 6); // date text box
doc.text(getCurrentDate(), 187, y);

y += 12;

// Unloading Row
doc.setFont("helvetica", "bold");
doc.text("Unloading:", 15, y);

doc.setFont("helvetica", "normal");

// By Transporter checkbox
doc.rect(45, y - 4, 6, 6);
doc.text("By Transporter", 55, y);

// By Customer checkbox
doc.rect(110, y - 4, 6, 6);
doc.text("By Customer", 120, y);

// Maintain same spacing as your old code
y += 15;

/* ================= SIGNATURE ================= */
doc.text("CUSTOMER’S SIGNATURE", PAGE_WIDTH - 75, y);
y += 25;

  /* ================= DEMURRAGE ================= */
  doc.setFont("helvetica", "bold");
  doc.text("SCHEDULE FOR DEMURRAGE CHARGES:", margin, y);

  doc.setFont("helvetica", "normal");
  y += 7;

  const demurrageText =
    "Demurrage will be charged immediately after 01 days from the date of arrival @ 2/- per day per Pkg. or Qtl. On charged weight whichever will be higher.";

  y = addTextWithPageBreak(demurrageText, y);

  y += 8;

  /* ================= NOTICE (AUTO NEXT PAGE SAFE) ================= */
  doc.setFont("helvetica", "bold");
  doc.text("NOTICE:", margin, y);

  doc.setFont("helvetica", "normal");
  y += 7;

  const noticeText =
    "The consignment covered under this Lorry Receipt is non-negotiable. Under no circumstances shall the transport operator be liable for any transaction between the consignor and the consignee or any third party, whether relating to the sale, purchase, or otherwise of the goods. The goods covered under this receipt may be delivered directly to the consignee against a separate acknowledgement, without production of the original consignee copy of the Lorry Receipt, and the common carrier shall be deemed fully discharged of all liabilities thereafter.";

  y = addTextWithPageBreak(noticeText, y);

  /* ================= PAGE 2 ================= */
  doc.addPage();
  y = 20;

  doc.setFont("helvetica", "bold");
  doc.text("AUTHORIZED SIGNATORY:", margin, y);

  doc.setFont("helvetica", "normal");
  y += 5;

  let signatureBase64 = null;
  try {
    signatureBase64 = await loadImageAsBase64(signature);
  } catch (err) {
    console.warn("Signature image not found");
  }

  if (signatureBase64) {
    doc.addImage(signatureBase64, "PNG", 23, y, 25, 25);
  }

  doc.text("(PACKYATRA RELOCATION PRIVATE LIMITED)", 15, 40);
  y = 55;

  doc.setFont("helvetica", "bold");
  doc.text("TERMS AND CONDITIONS FOR TRANSPORTATION OF CONSIGNMENTS:", margin, y);

  doc.setFont("helvetica", "normal");
  y += 8;


const termsText = [
  "1. I/We hereby agree to the terms and conditions set forth herein and declare that the information contained in this document is true and correct to the best of my/our knowledge.",
  "2. I/We have read, understood, and accept all the terms and conditions mentioned herein on this consignment note, on the front and overleaf, for this contract carriage.",
  "3. If marked “To Pay,” payment must be made before delivery.",
  "4. The consignor shall be liable for all consequences arising from any incorrect or false declaration of the contents of the consignment.",
  "5. The consignor shall be responsible for obtaining and handing over all necessary permits and documents required for transportation, and any failure to do so shall be at the consignor’s risk.",
  "6. Dangerous, prohibited, hazardous, inflammable, illegal, contraband goods will not be carried.",
  "7. The company will be at liberty to trans-ship goods from one vehicle to another at the company’s discretion.",
  "8. Packing material if provided by the company is the property of the carrier and will be taken back after unpacking (same day of unloading).",
  "9. Shipments not delivered within the specified time shall not be considered service failure when delay is due to acts of God, riots, war, public disturbances, government action, road closures and customs or documentation delays.",
  "10. The consignment is carried entirely at owner’s risk.",
  "11. The Carrier will not be responsible for any loss resulting from inadequate packing or inherent defects in the goods.",
  "12. Any transfer of goods through rope shall be at the sole discretion and risk of the customer.",
  "13. Any concerns during or after the service must be reported immediately to the carrier/helpdesk.",
  "14. In the event of any missing item, the user must obtain a Non-Delivery Certificate (NDC) or shortage certificate from the Company.",
  "15. Claims must be lodged immediately, and no claim shall be entertained after the prescribed time limit of two days.",
  "16. Claims for damage or loss must be supported by damage report, goods consignment note copy and relevant documentation.",
  "17. All consignments are booked under the Carriage by Road Act, 2007 and rules made thereunder.",
  "18. Section 10 – Limited Liability applies unless specifically booked under Section 11.",
  "19. Section 11 – Insured Risk shall apply if insurance has been taken and the insurance amount has been paid separately.",
  "20. Carrier liability under limited liability is restricted as per provisions of the Act.",
  "21. Demurrage will be charged after free period if delivery is delayed due to customer reasons.",
  "22. Consignments that remain undelivered for over 90 days may be sold or disposed of after due notice, in accordance with company policy.",
  "23. All communication made through the company by email or electronic media shall be considered valid and binding.",
  "24. GST shall be applicable as per prevailing law; exemption applies where notified.",
  "25. No person is authorized to alter, modify, overwrite, or waive any terms printed on the consignment note.",
  "26. The customer shall have no lien on carrier’s vehicles, equipment, or materials."
];
  y = addTextWithPageBreak(termsText, y);

  y += 10;

  doc.setFont("helvetica", "bold");
  doc.text("RECEIPT ACKNOWLEDGMENT (AT DELIVERY POINT)", PAGE_WIDTH / 2, y, { align: "center" });

  y += 8;
  doc.setFont("helvetica", "normal");

  const receiptText =
    "I hereby declare that my consignment moved through PACKYATRA RELOCATION PRIVATE LIMITED has been received in safe and sound condition and I further acknowledge that all services rendered were to my satisfaction.";

  y = addTextWithPageBreak(receiptText, y);

  y += 15;
  doc.text("CUSTOMER’S SIGNATURE", PAGE_WIDTH - 75, y);

// ===== FOOTER FUNCTION (Add on every page) =====
const addFooter = (doc) => {
  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    // Footer line separator
    doc.setDrawColor(150);
    doc.line(15, pageHeight - 35, pageWidth - 15, pageHeight - 35);

    // Terms & Conditions (Footer Text)
    // doc.setFont("helvetica", "normal");
    // doc.setFontSize(8);
    // doc.text(
    //   "This is a computer generated Lorry Receipt. All disputes are subject to jurisdiction. Goods are carried at owner's risk.",
    //   15,
    //   pageHeight - 28,
    //   { maxWidth: pageWidth - 30 }
    // );

    // // Signature Section
    // doc.setFont("helvetica", "bold");
    // doc.setFontSize(10);
    // doc.text("For Mover & Packers", pageWidth - 70, pageHeight - 18);

    // doc.setFont("helvetica", "normal");
    // doc.setFontSize(9);
    // doc.text("Authorized Signatory", pageWidth - 70, pageHeight - 10);

    // Page Number
    doc.setFontSize(9);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }
};

// ===== CALL THIS AT THE END BEFORE SAVING PDF =====
addFooter(doc);
  /* ================= SAVE ================= */
  doc.save("Goods_Consignment_Note.pdf");
};
