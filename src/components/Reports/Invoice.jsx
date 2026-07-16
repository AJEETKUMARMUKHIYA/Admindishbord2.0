import { useState } from "react";
import {
  generateInvoiceByQuotation,
  getInvoiceDetails,
} from "../../services/invoiceService";

// import { generateBookingConfirmationPDF as generateInvoicePDF }
// from "../../utils/goodsConsignmentNote";

import { generateGoodsConsignmentPDF } from "../../utils/goodsConsignmentNote";
import {
  FileText,
  Search,
  FileDown,
  AlertCircle,
  ReceiptText,
} from "lucide-react";

export default function Invoice() {
  const [quotationNumber, setQuotationNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceData, setInvoiceData] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     PREVIEW TEMPLATE
  ========================= */
  const previewInvoice = (data) => {
    return `
      <h2>Invoice ${data.invoiceNumber}</h2>
      <p><strong>Quotation No:</strong> ${data.quotationNumber}</p>
      <p><strong>Customer:</strong> ${data.customerName}</p>
      <p><strong>Total Amount:</strong> ₹ ${data.totalAmount}</p>
    `;
  };
 const previewInvoiceSearch = (data) => {
    return `
      <h2>Invoice ${data.invoice.invoiceNumber}</h2>
      <p><strong>Quotation No:</strong> ${data.invoice.quotationNumber}</p>
      <p><strong>Customer:</strong> ${data.invoice.customerName}</p>
      <p><strong>Total Amount:</strong> ₹ ${data.invoice.totalAmount}</p>
    `;
  };
  /* =========================
     GENERATE INVOICE
  ========================= */
  const handleGenerate = async () => {
    if (!quotationNumber) {
      setError("Please enter quotation number");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await generateInvoiceByQuotation(quotationNumber);

      setInvoiceData(response);
      setPreview(previewInvoice(response));

      alert("Invoice Generated Successfully");

    } catch (err) {
      setError(err.message || "Invoice generation failed");
      setInvoiceData(null);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     GET INVOICE DETAILS
  ========================= */
  const handleSearch = async () => {
    if (!invoiceNumber) {
      setError("Please enter invoice number");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getInvoiceDetails(invoiceNumber);

      setInvoiceData(response);
      setPreview(previewInvoiceSearch(response));

    } catch (err) {
      setError(err.message || "Invoice not found");
      setInvoiceData(null);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DOWNLOAD PDF
  ========================= */
  const handleDownload = async () => {
    if (!invoiceData) {
      setError("Generate or search invoice first");
      return;
    }

    await generateGoodsConsignmentPDF(invoiceData);
  };

  return (
    <div
      id="invoicePage"
      style={{
        fontFamily: "Inter, sans-serif",
        background: "var(--paper)",
        minHeight: "100%",
        padding: "32px clamp(16px, 4vw, 48px)",
        color: "var(--ink)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');
        #invoicePage {
          --ink: #12151C;
          --paper: #F5F6F4;
          --line: #E3E5E1;
          --accent: #2952E3;
          --accent-soft: #EAEFFD;
          --amber: #C67C1F;
          --success: #1E8E5A;
          --danger: #C6403E;
          --danger-soft: #FBEAEA;
          --muted: #6B7280;
        }
        #invoicePage .iv-card { background: #fff; border: 1px solid var(--line); border-radius: 14px; }
        #invoicePage .iv-btn { font-family: 'Inter', sans-serif; font-weight: 600; font-size: 13.5px; border-radius: 9px; padding: 10px 18px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; border: 1px solid transparent; transition: all 0.15s ease; white-space: nowrap; }
        #invoicePage .iv-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        #invoicePage .iv-btn-accent { background: var(--accent); color: #fff; }
        #invoicePage .iv-btn-accent:hover:not(:disabled) { background: #2141c2; }
        #invoicePage .iv-btn-amber { background: var(--amber); color: #fff; }
        #invoicePage .iv-btn-amber:hover:not(:disabled) { background: #a6690f; }
        #invoicePage .iv-btn-success { background: var(--success); color: #fff; }
        #invoicePage .iv-btn-success:hover:not(:disabled) { background: #17724a; }
        #invoicePage .iv-input { width: 100%; box-sizing: border-box; border: 1px solid var(--line); border-radius: 9px; padding: 10px 12px; font-family: 'Inter', sans-serif; font-size: 14px; color: var(--ink); background: #fff; }
        #invoicePage .iv-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
        #invoicePage .iv-label { display: block; font-size: 12.5px; font-weight: 600; color: var(--muted); margin-bottom: 6px; }
        #invoicePage .iv-preview-content { font-family: 'Inter', sans-serif; color: var(--ink); }
        #invoicePage .iv-preview-content h2 { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; margin: 0 0 14px; letter-spacing: -0.2px; }
        #invoicePage .iv-preview-content p { font-size: 14.5px; line-height: 1.9; margin: 0; color: var(--ink); }
        #invoicePage .iv-preview-content p strong { color: var(--muted); font-weight: 600; margin-right: 6px; }
        #invoicePage .iv-preview-empty { color: var(--muted); font-size: 14px; text-align: center; padding: 40px 0; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "var(--accent)", fontWeight: 500, letterSpacing: 0.4, marginBottom: 6 }}>
          BOOKINGS
        </div>
        <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 30, fontWeight: 700, margin: 0, letterSpacing: -0.4 }}>
          Invoices
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 20, alignItems: "start" }}>
        {/* Generate / Search card */}
        <div className="iv-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <FileText size={18} color="var(--accent)" />
            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 17, fontWeight: 700, margin: 0 }}>
              Generate &amp; search
            </h3>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="iv-label">GC number (generate)</label>
            <input
              className="iv-input"
              value={quotationNumber}
              onChange={(e) => setQuotationNumber(e.target.value)}
              placeholder="Enter quotation number"
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="iv-label">GC number (search / download)</label>
            <input
              className="iv-input"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Enter GC number"
            />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="iv-btn iv-btn-accent"
              onClick={handleGenerate}
              disabled={loading}
            >
              <FileText size={15} /> {loading ? "Processing…" : "Generate invoice"}
            </button>

            <button
              className="iv-btn iv-btn-amber"
              onClick={handleSearch}
              disabled={loading}
            >
              <Search size={15} /> Get invoice details
            </button>

            <button
              className="iv-btn iv-btn-success"
              onClick={handleDownload}
              disabled={!invoiceData}
            >
              <FileDown size={15} /> Download invoice PDF
            </button>
          </div>

          {error && (
            <div style={{
              marginTop: 18, display: "flex", alignItems: "center", gap: 8,
              padding: "10px 14px", borderRadius: 9, background: "var(--danger-soft)",
              color: "var(--danger)", fontSize: 13.5, fontWeight: 500,
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </div>

        {/* Preview card */}
        <div className="iv-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <ReceiptText size={18} color="var(--accent)" />
            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 17, fontWeight: 700, margin: 0 }}>
              Preview
            </h3>
          </div>

          {preview ? (
            <div
              className="iv-preview-content"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          ) : (
            <div className="iv-preview-empty">No invoice data</div>
          )}
        </div>
      </div>
    </div>
  );
}
