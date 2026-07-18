import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import signature from "../assets/signature.png";

export const generateBookingConfirmationPDF = async (bookingData) => {
  const doc = new jsPDF("p", "mm", "a4");
  const PAGE_HEIGHT = doc.internal.pageSize.height;
  const PAGE_WIDTH = doc.internal.pageSize.width;
  const margin = 15;
  const CONTENT_WIDTH = 180;

  // Helper: Convert image to base64
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

  // Header Draw Utility
  const drawHeader = (pageNum, totalPages) => {
    // Top colored decorative bar
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(margin, 10, 130, 1.5, "F");
    doc.setFillColor(14, 165, 233); // Sky-500
    doc.rect(margin + 130, 10, 50, 1.5, "F");

    // Geometric Motion Logo Block
    doc.setFillColor(14, 165, 233); // Sky-500
    doc.rect(margin, 16, 6, 6, "F");
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(margin + 1.5, 17.5, 3, 3, "F");

    // Company Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text("PACKYATRA", margin + 9, 21.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text("RELOCATION PRIVATE LIMITED", margin + 9, 26);

    // Right-aligned Corporate Contact Info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(14, 165, 233); // Sky-500
    doc.text("www.packyatra.com", PAGE_WIDTH - margin, 18.5, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105); // Slate-600
    doc.text("Ph: +91 9071 535 535", PAGE_WIDTH - margin, 23, { align: "right" });
    doc.text("Email: info@packyatra.com", PAGE_WIDTH - margin, 27.5, { align: "right" });

    // Elegant separator line
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.4);
    doc.line(margin, 31, PAGE_WIDTH - margin, 31);
  };

  // Footer Draw Utility
  const drawFooter = (pageNum, totalPages) => {
    const footerY = PAGE_HEIGHT - 18;

    // Light divider line
    doc.setDrawColor(241, 245, 249); // Slate-100
    doc.setLineWidth(0.4);
    doc.line(margin, footerY - 2, PAGE_WIDTH - margin, footerY - 2);

    // Footer background panel
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.rect(margin, footerY - 1, CONTENT_WIDTH, 14, "F");

    // Corporate info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85); // Slate-700
    doc.text("© PackYatra Relocation Private Limited", margin + 4, footerY + 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text("Regd. Office: 122, 4th Main, West of Chord Road, Manjunath Nagar, Bangalore - 560010, Karnataka, India", margin + 4, footerY + 8.5);

    // Page numbering
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105); // Slate-600
    doc.text(`Page ${pageNum} of ${totalPages}`, PAGE_WIDTH - margin - 4, footerY + 6, { align: "right" });
  };

  // Helper: Renders styled lists of terms with auto-pagination
  const addTermsBlock = (title, itemsList, currentY) => {
    let internalY = currentY;
    
    // Safety padding before new block
    if (internalY + 22 > PAGE_HEIGHT - 25) {
      doc.addPage();
      internalY = 42;
    }

    // Section title
    doc.setFillColor(14, 165, 233); // Sky-500
    doc.rect(margin, internalY, 2.5, 4.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text(title, margin + 4, internalY + 3.5);
    internalY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105); // Slate-600

    itemsList.forEach((termText, index) => {
      let fullText = termText.trim();
      // If it doesn't already start with a bullet (•, -, *) or a manual numbering pattern (like "1.", "1)"), prepend index
      if (!fullText.startsWith("•") && !fullText.startsWith("-") && !fullText.startsWith("*") && !/^\d+[\.\)]/.test(fullText)) {
        const bulletPrefix = `${index + 1}. `;
        fullText = bulletPrefix + fullText;
      }
      const wrappedText = doc.splitTextToSize(fullText, CONTENT_WIDTH - 4);
      const textHeight = doc.getTextDimensions(wrappedText, { fontSize: 8, lineHeightFactor: 1.3 }).h;

      if (internalY + textHeight > PAGE_HEIGHT - 25) {
        doc.addPage();
        internalY = 42;
      }

      doc.text(wrappedText, margin + 2, internalY, { maxWidth: CONTENT_WIDTH - 4, lineHeightFactor: 1.3 });
      internalY += textHeight + 3;
    });

    return internalY + 4;
  };

  /* =======================================================
     PAGE 1: BRAND SUMMARY & COMMERCIALS
     ======================================================= */
  let y = 42;

  // 1. Sleek Invoice Title Block
  doc.setFillColor(14, 165, 233); // Sky-500
  doc.rect(margin, y, 3, 9, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text("OFFICIAL BOOKING INVOICE", margin + 5, y + 6.5);
  y += 14;

  const invData = bookingData.invoice || {};

  // 2. Customer Information Grid (Custom plain table with Slate divider lines)
  const pickupDateStr = invData.pickupDate 
    ? new Date(invData.pickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) 
    : "-";

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin, top: 40, bottom: 25 },
    body: [
      ["Invoice No:", invData.invoiceNumber || "-", "Pickup Date:", pickupDateStr],
      ["Customer Name:", invData.customerName || "-", "Preferred Slot:", invData.slotTime || "-"],
      ["Contact Phone:", invData.phone || "-", "Volume Estimate:", invData.totalVolume ? `${invData.totalVolume} CFT` : "-"],
      [
        "Moving Route:",
        { content: `${invData.fromAddress || "-"}  to  ${invData.toAddress || "-"}`, colSpan: 3 }
      ]
    ],
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 9,
      textColor: [30, 41, 59], // Slate-800
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
      lineColor: [226, 232, 240], // Slate-200
      lineWidth: 0.4,
    },
    columnStyles: {
      0: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 32 },
      1: { cellWidth: 58 },
      2: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 32 },
      3: { cellWidth: 58 },
    }
  });

  y = doc.lastAutoTable.finalY + 8;

  // 3. Intro Note
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85); // Slate-700
  
  const introText = [
    `Dear Customer,`,
    ``,
    `Thank you for confirming your relocation booking with PackYatra. We are pleased to provide your official booking invoice. Our team is fully committed to delivering a seamless, secure, and professional shifting process.`
  ];
  
  doc.text(introText, margin, y, { maxWidth: CONTENT_WIDTH, lineHeightFactor: 1.35 });
  const introHeight = doc.getTextDimensions(introText, { maxWidth: CONTENT_WIDTH, lineHeightFactor: 1.35 }).h;
  y += introHeight + 10;

  // 4. Section: Cost Breakup
  doc.setFillColor(14, 165, 233); // Sky-500
  doc.rect(margin, y, 3, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text("Commercial Billing Summary (INR)", margin + 5, y + 4.5);
  y += 9;

  // Render Premium Cost Breakup Table
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin, top: 40, bottom: 25 },
    head: [["Service Description Details", "Billing Rate Status"]],
    body: [
      ["Professional Safe Transit & Logistics Freight Charges", "Included in Package"],
      ["Industrial Grade Multi-Layer Packing Materials & Labor", "Included in Package"],
      ["Safe Stacking, Systematic Loading & Unloading Services", "Included in Package"],
      ["Dedicated Vehicle Carrier / Allied Services (if applicable)", invData.totalAmount?.car ? `INR ${invData.totalAmount.car.toLocaleString()}` : "Included"],
      ["ESTIMATED ALL-INCLUSIVE ESTIMATE", `INR ${(invData.totalAmount?.toLocaleString() || "-")} /-`]
    ],
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59], // Slate-800
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: 3.5,
    },
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      textColor: [71, 85, 105],
      cellPadding: 3.5,
      lineColor: [226, 232, 240],
      lineWidth: 0.4,
    },
    columnStyles: {
      0: { cellWidth: 125 },
      1: { cellWidth: 55, fontStyle: "bold", halign: "right" }
    },
    didParseCell: (cellData) => {
      // Style grand total row beautifully
      if (cellData.row.index === 4) {
        cellData.cell.styles.fillColor = [241, 245, 249]; // Slate-100
        cellData.cell.styles.textColor = [15, 23, 42]; // Slate-900
        cellData.cell.styles.fontStyle = "bold";
        cellData.cell.styles.fontSize = 9;
        if (cellData.column.index === 1) {
          cellData.cell.styles.textColor = [14, 165, 233]; // Sky-500
        }
      }
    }
  });

  y = doc.lastAutoTable.finalY + 12;

  // 5. Signatory Block (Check if fits on Page 1, else wrap)
  if (y + 35 > PAGE_HEIGHT - 25) {
    doc.addPage();
    y = 42;
  }

  // Draw solid separating line
  doc.setDrawColor(241, 245, 249); // Slate-100
  doc.setLineWidth(0.4);
  doc.line(margin, y, PAGE_WIDTH - margin, y);
  y += 6;

  // Left side: Signature
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text("Authorized Signatory,", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text("PackYatra Relocation Private Ltd.", margin, y + 4.5);

  let signatureBase64 = null;
  try {
    signatureBase64 = await loadImageAsBase64(signature);
  } catch (err) {
    console.warn("Signature image skipped or missing.");
  }

  if (signatureBase64) {
    doc.addImage(signatureBase64, "PNG", margin + 1, y + 6, 25, 11);
  } else {
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y + 14, margin + 35, y + 14);
  }

  // Right side: Corporate info
  const rightX = PAGE_WIDTH - margin - 80;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text("Corporate Credentials", rightX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text("CIN:  U68100KA2025PTC210677", rightX, y + 5);
  doc.text("PAN:  AAXCP1234Q", rightX, y + 9);
  doc.text("GST:  29AAQCP3437K1ZR", rightX, y + 13);


  /* =======================================================
     PAGE 2: INVENTORY & LEGAL POLICIES
     ======================================================= */
  doc.addPage();
  y = 42;

  // 6. Section: Itemized Shifting Inventory Manifest (Beautiful 2-Column Dense Grid)
  doc.setFillColor(14, 165, 233); // Sky-500
  doc.rect(margin, y, 3, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text("Itemized Shifting Inventory Manifest", margin + 5, y + 4.5);
  y += 9;

  const rawItems = bookingData.items || [];
  const sideBySideRows = [];
  for (let i = 0; i < rawItems.length; i += 2) {
    const leftItem = rawItems[i];
    const rightItem = rawItems[i + 1] || { itemName: "", bookedQuantity: "" };
    
    sideBySideRows.push([
      leftItem.itemName || "-",
      leftItem.bookedQuantity || "1",
      rightItem.itemName || (rightItem.itemName === "" ? "" : "-"),
      rightItem.bookedQuantity || (rightItem.itemName === "" ? "" : "1")
    ]);
  }

  if (sideBySideRows.length === 0) {
    sideBySideRows.push(["No individual items logged", "-", "", ""]);
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin, top: 40, bottom: 25 },
    head: [["Item Description", "Qty", "Item Description", "Qty"]],
    body: sideBySideRows,
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59], // Slate-800
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: 3,
    },
    styles: {
      font: "helvetica",
      fontSize: 8,
      textColor: [71, 85, 105],
      cellPadding: 2.8,
      lineColor: [241, 245, 249],
      lineWidth: 0.4,
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 20, halign: "center", fontStyle: "bold" },
      2: { cellWidth: 70 },
      3: { cellWidth: 20, halign: "center", fontStyle: "bold" }
    }
  });

  y = doc.lastAutoTable.finalY + 10;

  // 7. Payment Terms Section
  const paymentTerms = [
    "1. Kindly note that to confirm your Packers & Movers booking and reserve your preferred slot, an advance payment of 10% of the total amount is required.",
    "2. After the initial 10% booking amount, the remaining 90% will be paid as 80% during loading and the final 10% before unloading.",
    "3. We support all major payment methods available in India, such as UPI, Credit/Debit Cards and Net Banking.",
    "4. Kindly ensure that all payments are made only to Packyatra Relocation Private Limited. Payments made to any other individual or account will not be accepted."
  ];
  y = addTermsBlock("Payment Terms and Condition:", paymentTerms, y);

  // 8. Prohibited Items Section
  const prohibitedItems = [
    "For security reasons, the company does not accept cash, jewellery, valuables, or important documents for transportation. These items must be kept in the client’s personal custody.",
    "We do not accept to move perishable goods, arms & ammunitions, hazardous material like crackers, explosives, chemicals, filled gas cylinder, battery acids, and inflammable oils; such as diesel, petrol, kerosene, gasoline, narcotics & counter brand items."
  ];
  y = addTermsBlock("Prohibited Items for Transportation:", prohibitedItems, y);

  // 9. General Terms & Conditions
  const generalTerms = [
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
  y = addTermsBlock("Terms and Conditions:", generalTerms, y);


  /* =======================================================
     POST-PROCESSING: DRAW GLOBAL EVERY-PAGE HEADERS/FOOTERS
     ======================================================= */
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawHeader(i, totalPages);
    drawFooter(i, totalPages);
  }

  doc.save("PackyatraInvoice.pdf");
};

