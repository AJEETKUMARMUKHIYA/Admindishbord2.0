import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import signature from "../assets/signature.png";

export const generateBookingConfirmationPDF = async (bookingData) => {
  const {
    bookingId,
    price,
    customerName,
    customerEmail,
    customerPhone,
    shiftingDate,
    selectedTimeSlot,
    timeSlots = [],
    selectedItems = [],
    fromAddress,
    toAddress,
    totalCFT,
  } = bookingData;

  const doc = new jsPDF("p", "mm", "a4");
  const PAGE_HEIGHT = doc.internal.pageSize.height;
  const margin = 18;
  const FOOTER_HEIGHT = 50;
  let y = margin;

 
const SAFE_BOTTOM = PAGE_HEIGHT - FOOTER_HEIGHT - 10; // 🔑 footer buffer


const TOP_MARGIN = 55;
const BOTTOM_MARGIN = 30;
const CONTENT_WIDTH = 175;

  const addTextWithPageBreak = (textArray, y) => {
  const h = doc.getTextDimensions(textArray, { maxWidth: CONTENT_WIDTH }).h;

  if (y + h > SAFE_BOTTOM) {
    doc.addPage();
    y = TOP_MARGIN;
  }

  doc.text(textArray, margin, y, { maxWidth: CONTENT_WIDTH });
  return y + h + 8;
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

    img.onerror = () => {
      reject(new Error("Image load failed"));
    };
  });
};

  /*=================================
   header part 
  =================================*/
  // ===== HEADER BACKGROUND =====
doc.setFillColor(0, 242, 254); 
doc.rect(15, 15, 180, 28, "F");

// ===== LEFT SIDE (COMPANY NAME) =====
doc.setTextColor(0, 0, 0);
doc.setFontSize(16);
doc.setFont("helvetica", "bold");
doc.text("PACKYATRA", 25, 30);

doc.setFontSize(10);
doc.text("RELOCATION PRIVATE LIMITED", 25, 37);

// ===== RIGHT SIDE (CONTACT INFO) =====
doc.setFontSize(9);
doc.setFont("helvetica", "normal");

doc.text("www.packyatra.com", 175, 26, { align: "right" });
doc.text("Ph No: 9071 535 535", 175, 32, { align: "right" });
doc.text("info@packyatra.com", 175, 38, { align: "right" });

  /* =======================
     TITLE
  ======================= */
   y += 35;
  doc.setFontSize(18);
  doc.text("Quotation / Booking Confirmation", 100, y, { align: "center" });
  y += 5;

  /* =======================
     CUSTOMER INFORMATION
  ======================= */
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Customer Information", margin, y);
  doc.setFont("helvetica", "normal");
  y += 5;
const pickupTimeMap = {
  1: "9:30AM",
  2: "12:30PM",
  3: "4:00PM"
};
autoTable(doc, {
  startY: y,

    body: [
    ["Quotation No", bookingData.quotationNumber  || "-", "Pickup Date", bookingData.pickupDate || "-"],
    ["Name", bookingData.customerName || "-", "Pickup Time", bookingData.slotTime || "-"],
    ["Mobile No", bookingData.phone || "-", "Delivery ETA", "-"],
    ["Moving Type", "Household", "Total Volume(CFT)", bookingData.totalVolume||"-"],
  ],
  theme: "grid",
 
  styles: {
    fontSize: 10,
    fillColor: false,            // no background
    textColor: 0,
    lineColor: [160, 160, 160],  // light grey borders
    lineWidth: 0.6,
    minCellHeight: 10,           // 🔑 exact row height
    valign: "middle",
  },

  columnStyles: {
    0: {
      cellWidth: 40,
      fontStyle: "bold",
    },
    1: {
      cellWidth: 55,
    },
    2: {
      cellWidth: 40,
      fontStyle: "bold",
    },
    3: {
      cellWidth: 43,
    },
  },
});
y = doc.lastAutoTable.finalY + 5;


  /* =======================
     INTRO TEXT
  ======================= */
  doc.setFontSize(11);

  const intro = `Dear Sir / Madam,
  
We thank you for your valuable enquiry for transportation of used household
goods from ${bookingData.fromAddress || "______"} to ${bookingData. toAddress || "______"}.
We are pleased to quote our rates for the same as under:`;
  doc.text(intro.split("\n"), margin, y);
  y += 30;

  /* =======================
     COST BREAKUP
  ======================= */
  doc.setFont("helvetica", "bold");
  doc.text("Cost Breakup (INR)", margin, y);
  doc.setFont("helvetica", "normal");
  y += 4;//10

  autoTable(doc, {
    startY: y,
    head: [["Description", "Amount"]],
    body: [
      ["Freight Charges","Include"],
      ["Packing Labour Charges", "Include"],
      ["Loading / Unloading Charges",  "Include"],
      ["Car Transportation Charges",  bookingData.totalAmount?.car || "-"],
      ["GRAND TOTAL", bookingData.totalAmount || "-"],
    ],
    theme: "grid",
    headStyles: { fillColor: [0, 242, 254] },
    styles: { fontSize: 10, cellPadding: 3 },
  });
  y = doc.lastAutoTable.finalY + 20;

  /* =======================
     SIGNATORY
  ======================= */
  doc.setFont("helvetica", "bold");
  doc.text(
    ["Authorized Signatory,"],
    
    margin,
    y
  );
// switch back to normal if needed
doc.setFont("helvetica", "normal");

  y += 2;
 let signatureBase64 = null;

try {
  signatureBase64 = await loadImageAsBase64(signature);

} catch (err) {
  console.warn("Signature image not found, skipping signature"+signatureBase64);
}

if (signatureBase64) {
  doc.addImage(signatureBase64, "PNG", margin+5, y, 25, 25);
}
y+=30;
  /* =======================
     COMPANY INFO
  ======================= */
  doc.setFont("helvetica", "bold");
  const companyInfo = `PACKYATRA RELOCATION PRIVATE LIMITED
  CIN: U68100KA2025PTC210677
  PAN: AAXCP1234Q
  GST:29AAQCP3437K1ZR`;
  doc.text(companyInfo.split("\n"), margin, y);
  // switch back to normal if needed
  doc.setFont("helvetica", "normal");
  y += 90;

  /* =======================
     ITEMS TABLE
  ======================= */
  doc.setFont("helvetica", "bold");
  doc.text("Items (Name & Qty)", margin, y);
  doc.setFont("helvetica", "normal");

  y += 10;

  autoTable(doc, {
    startY: y,
    head: [["Item Name", "Quantity"]],
    headStyles: { fillColor: [0, 242, 254] },
    body:
      bookingData.items && bookingData.items.length > 0
        ? bookingData.items.map((item) => [
            item.name || "-",
            item.qty || 1,
          ])
        : [["-", "-"]],
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
  });
  y = doc.lastAutoTable.finalY + 20;

  /* =======================
     PAYMENT TERMS
  ======================= */
  doc.setFont("helvetica", "bold");
  doc.text("Payment Terms and Condition:", margin, y);
  doc.setFont("helvetica", "normal");
  y += 10;


  doc.setFontSize(10);
  const paymentTerms = [
    "1. Kindly note that to confirm your Packers & Movers booking and reserve your preferred slot, an advance payment of 10% of the total amount is required.",
    "2. After the initial 10% booking amount, the remaining 90% will be paid as 80% during loading and the final 10% before unloading.",
    "3. We support all major payment methods available in India, such as UPI, Credit/Debit Cards and Net Banking",
    "4. Kindly ensure that all payments are made only to Packyatra Relocation Private Limited. Payments made to any other individual or account will not be accepted.",
  ];

  y = addTextWithPageBreak(paymentTerms, y);
  /* =======================
     PROHIBITED ITEMS
  ======================= */
  doc.setFont("helvetica", "bold");
  doc.text("Prohibited Items for Transportation:", margin, y);
  doc.setFont("helvetica", "normal");
  y += 10;

  const prohibitedItems = ` For security reasons, the company does not accept cash, jewellery, valuables, or important documents for transportation. These  
items must be kept in the client’s personal custody. We do not accept to move perishable goods, arms & ammunitions, hazardous  
material like crackers, explosives, chemicals, filled gas cylinder, battery acids, and inflammable oils; such as diesel, petrol, kerosene,  
gasoline, narcotics & counter brand items.`;

  y = addTextWithPageBreak(prohibitedItems.split("\n"), y);
  /* =======================
     TERMS & CONDITIONS
  ======================= */
  doc.setFont("helvetica", "bold");
  doc.text("Terms and Conditions:", margin, y);
  doc.setFont("helvetica", "normal");
  y += 10;

  const terms = [
  "• If you book a direct FTL (Full Truck Load), the expected daily movement will be approximately 300 km. For share-based bookings, delivery timelines will be as per the defined TAT.",
  "• Pickup and delivery days are excluded from the transit timeline.",
  "• Delivery timelines may vary due to traffic conditions, weather, or regulatory approvals.",
  "• Packyatra shall not be responsible for any pre-existing defects, damages, or functional issues identified before transportation.",
  "• Electrical, plumbing, carpentry, and AC services are not included unless specifically mentioned in the quotation or invoice.",
  "• Personal items such as goggles, mobile chargers, cartons, or belongings left inside the vehicle will be carried strictly at the owner’s sole risk. No claims shall be entertained by Packyatra Relocation Private Limited.",
  "• Helmets or riding gear will be transported only if they are specifically mentioned and charged in the invoice.",
  "• Clients are advised to opt for Packyatra Relocation Private Limited risk coverage or obtain insurance for additional protection of their goods.",
  "• All consignments transported through our lorries are carried entirely at the owner’s risk. Customers are advised to arrange insurance coverage for their consignments.",
  "• Charges for Mathadi (union labor and associated services) shall be borne by the client and are excluded from the quotation, wherever applicable (e.g., Mumbai, Pune, Kerala, etc.).",
  "• Unloading, unpacking, and rearranging services are not available in Kerala.",
  "• All packing materials remain the property of Packyatra and must be returned on the day of unloading. Retention of any boxes will incur a charge of Rs. 60 per carton.",
  "• The quotation does not include dismantling (carpentry work) or installation/fitting of electrical or electronic appliances unless specified.",
  "• Any permissions or fees required at the client’s location to facilitate shifting—such as society charges, parking fees, or entry permissions—shall be borne by the client.",
  "• Rescheduling is permitted up to 24 hours prior to the scheduled move date at no additional cost, provided the support team is informed in advance.",
  "• For cancellations, clients are requested to contact the Packyatra support team.",
  "• If any third-party services are involved (e.g., AC dismantling) or if local transportation and labor are utilized, applicable charges for such services will be levied."
];

  y = addTextWithPageBreak(terms, y);
  
   /* ================= FOOTER ================= */
    const drawFooter = () => {
    const footerY = PAGE_HEIGHT - FOOTER_HEIGHT;

    doc.setFillColor(245, 245, 245);
    doc.rect(0, footerY, 210, FOOTER_HEIGHT, "F");

    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.text("© PackYatra Relocation Private Limited", 105, footerY + 10, {
      align: "center"
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(
      "122, 4th Main, 1st stage,1st phase,west of chord road,manjunath nagar,Bangalore - 560010, India",
      105,
      footerY + 16,
      { align: "center" }
    );
  };

  doc.setPage(doc.getNumberOfPages());
  drawFooter();

  doc.save("PackyatraQuotation.pdf");
};
