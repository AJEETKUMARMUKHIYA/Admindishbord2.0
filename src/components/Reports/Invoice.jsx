import { useState } from "react";
import {
  generateInvoiceByQuotation,
  getInvoiceDetails,
} from "../../services/invoiceService";
import { generateGoodsConsignmentPDF } from "../../utils/goodsConsignmentNote";
import {
  FileText,
  Search,
  FileDown,
  AlertCircle,
  ReceiptText,
  ClipboardList,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function Invoice() {
  const [quotationNumber, setQuotationNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const activeInvoice = invoiceData?.invoice || invoiceData;

  /* =========================
     GENERATE INVOICE
  ========================= */
  const handleGenerate = async () => {
    if (!quotationNumber.trim()) {
      setError("Please enter quotation number to generate");
      setSuccess("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await generateInvoiceByQuotation(quotationNumber.trim());

      setInvoiceData(response);
      setSuccess("Invoice generated successfully!");
      toast.success("Invoice generated successfully!");
    } catch (err) {
      setError(err.message || "Invoice generation failed. Ensure quotation number is valid.");
      setInvoiceData(null);
      toast.error(err.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     GET INVOICE DETAILS
  ========================= */
  const handleSearch = async () => {
    if (!invoiceNumber.trim()) {
      setError("Please enter invoice number to search");
      setSuccess("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await getInvoiceDetails(invoiceNumber.trim());

      setInvoiceData(response);
      setSuccess("Invoice details retrieved!");
      toast.success("Invoice retrieved successfully");
    } catch (err) {
      setError(err.message || "Invoice not found");
      setInvoiceData(null);
      toast.error(err.message || "Invoice not found");
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

    try {
      await generateGoodsConsignmentPDF(invoiceData);
      toast.success("Invoice PDF downloaded successfully");
    } catch (err) {
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div id="invoicePage" className="invoice-module">
      <style>{`
        #invoicePage {
          --ink: #0f172a;
          --paper: #f8fafc;
          --line: #e2e8f0;
          --accent: #2563eb;
          --accent-soft: #eff6ff;
          --amber: #d97706;
          --amber-soft: #fffbeb;
          --success: #16a34a;
          --success-soft: #f0fdf4;
          --danger: #dc2626;
          --danger-soft: #fef2f2;
          --muted: #64748b;
        }

        #invoicePage .invoice-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 1024px) {
          #invoicePage .invoice-grid {
            grid-template-columns: repeat(12, minmax(0, 1fr));
          }
          #invoicePage .col-left {
            grid-column: span 5;
          }
          #invoicePage .col-right {
            grid-column: span 7;
          }
        }

        #invoicePage .iv-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03), 0 1px 2px rgba(15, 23, 42, 0.02);
          overflow: hidden;
        }

        #invoicePage .iv-card-header {
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fafafa;
        }

        #invoicePage .iv-card-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        #invoicePage .iv-card-body {
          padding: 20px;
        }

        #invoicePage .iv-btn {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 13px;
          border-radius: 8px;
          padding: 10px 16px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1px solid transparent;
          transition: all 0.15s ease;
          width: 100%;
        }

        #invoicePage .iv-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        #invoicePage .iv-btn-accent {
          background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
          color: #ffffff;
          border: none;
        }

        #invoicePage .iv-btn-accent:hover:not(:disabled) {
          opacity: 0.95;
          transform: translateY(-1px);
        }

        #invoicePage .iv-btn-amber {
          background: #ffffff;
          border-color: #cbd5e1;
          color: #334155;
        }

        #invoicePage .iv-btn-amber:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #94a3b8;
          color: #0f172a;
        }

        #invoicePage .iv-btn-success {
          background: var(--success);
          color: #ffffff;
        }

        #invoicePage .iv-btn-success:hover:not(:disabled) {
          background: #15803d;
        }

        #invoicePage .iv-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }

        #invoicePage .iv-label {
          font-size: 11.5px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        #invoicePage .iv-input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 9px 12px;
          font-family: 'Inter', sans-serif;
          font-size: 13.5px;
          color: var(--ink);
          background: #ffffff;
          transition: all 0.15s ease;
        }

        #invoicePage .iv-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        /* Invoice Sheet Layout */
        #invoicePage .invoice-sheet {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 24px;
          background: #ffffff;
          position: relative;
        }

        #invoicePage .invoice-sheet-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }

        #invoicePage .sheet-meta {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 1.2px;
          text-transform: uppercase;
          display: block;
          margin-bottom: 4px;
        }

        #invoicePage .sheet-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: #0f172a;
        }

        #invoicePage .invoice-meta-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        #invoicePage .meta-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px 14px;
        }

        #invoicePage .meta-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 4px 0;
        }

        #invoicePage .meta-value {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--ink);
          margin: 0;
        }

        #invoicePage .invoice-sheet-footer {
          margin-top: 24px;
          border-top: 1px dashed #e2e8f0;
          padding-top: 16px;
          text-align: center;
          color: var(--muted);
          font-size: 12px;
        }
      `}</style>

      <div className="invoice-grid">
        {/* Left column: Controls */}
        <div className="col-left iv-card">
          <div className="iv-card-header">
            <ClipboardList size={16} className="text-blue-600" />
            <h3 className="iv-card-title">Billing Desk</h3>
          </div>
          <div className="iv-card-body">
            {/* Generate form */}
            <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "20px", marginBottom: "20px" }}>
              <div className="iv-input-wrapper">
                <label className="iv-label">GC Number (Generate New Invoice)</label>
                <input
                  type="text"
                  className="iv-input"
                  value={quotationNumber}
                  onChange={(e) => setQuotationNumber(e.target.value)}
                  placeholder="e.g. QTN-10234"
                />
              </div>

              <button
                className="iv-btn iv-btn-accent"
                onClick={handleGenerate}
                disabled={loading || !quotationNumber.trim()}
              >
                <FileText size={14} /> {loading ? "Processing…" : "Generate Invoice"}
              </button>
            </div>

            {/* Search form */}
            <div style={{ marginBottom: "20px" }}>
              <div className="iv-input-wrapper">
                <label className="iv-label">GC Number (Retrieve Existing)</label>
                <input
                  type="text"
                  className="iv-input"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. QTN-10234"
                />
              </div>

              <button
                className="iv-btn iv-btn-amber"
                onClick={handleSearch}
                disabled={loading || !invoiceNumber.trim()}
              >
                <Search size={14} /> Retrieve Details
              </button>
            </div>

            {/* Download section */}
            {activeInvoice && (
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
                <button
                  className="iv-btn iv-btn-success"
                  onClick={handleDownload}
                >
                  <FileDown size={14} /> Download Consignment PDF
                </button>
              </div>
            )}

            {/* Feedback Notifications */}
            {error && (
              <div style={{
                marginTop: 16, display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderRadius: 8, background: "var(--danger-soft)",
                color: "var(--danger)", fontSize: 13, fontWeight: 500,
              }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}

            {success && (
              <div style={{
                marginTop: 16, display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderRadius: 8, background: "var(--success-soft)",
                color: "var(--success)", fontSize: 13, fontWeight: 500,
              }}>
                <CheckCircle size={15} /> {success}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Beautiful Invoice Preview Sheet */}
        <div className="col-right iv-card">
          <div className="iv-card-header">
            <ReceiptText size={16} className="text-emerald-600" />
            <h3 className="iv-card-title">Commercial Consignment Preview</h3>
          </div>
          <div className="iv-card-body" style={{ background: "#f8fafc" }}>
            {activeInvoice ? (
              <div className="invoice-sheet animate-fade-in">
                <div className="invoice-sheet-header">
                  <div>
                    <span className="sheet-meta">COMMERCIAL RECORD</span>
                    <h4 className="sheet-title">Consignment Invoice</h4>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      display: "inline-flex", padding: "2px 8px", background: "var(--success-soft)",
                      color: "var(--success)", fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase",
                      borderRadius: "4px", border: "1px solid #bbf7d0"
                    }}>
                      Paid / Settled
                    </span>
                  </div>
                </div>

                <div className="invoice-meta-grid">
                  <div className="meta-box">
                    <p className="meta-label">Invoice Number</p>
                    <p className="meta-value" style={{ fontFamily: "IBM Plex Mono, monospace", color: "var(--accent)" }}>
                      {activeInvoice.invoiceNumber || "—"}
                    </p>
                  </div>

                  <div className="meta-box">
                    <p className="meta-label">GC Quotation Reference</p>
                    <p className="meta-value" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                      {activeInvoice.quotationNumber || "—"}
                    </p>
                  </div>

                  <div className="meta-box" style={{ gridColumn: "span 2" }}>
                    <p className="meta-label">Consignee Name</p>
                    <p className="meta-value" style={{ fontSize: "14px" }}>
                      {activeInvoice.customerName || "—"}
                    </p>
                  </div>

                  <div className="meta-box" style={{ gridColumn: "span 2", background: "#0f172a", borderColor: "#0f172a" }}>
                    <p className="meta-label" style={{ color: "#94a3b8" }}>Consignment Value (Total Billed)</p>
                    <p className="meta-value" style={{ fontSize: "20px", color: "#ffffff", fontWeight: "800" }}>
                      ₹ {activeInvoice.totalAmount?.toLocaleString() || "—"}
                    </p>
                  </div>
                </div>

                <div style={{ padding: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12.5px" }}>
                  <p style={{ margin: 0, fontWeight: 600, color: "var(--ink)" }}>Terms & Conditions</p>
                  <p style={{ margin: "4px 0 0 0", color: "var(--muted)", lineHeight: 1.5 }}>
                    This is an electronically generated Goods Consignment Invoice record. The payment is processed in accordance with our standard packers and movers moving agreement.
                  </p>
                </div>

                <div className="invoice-sheet-footer">
                  <p style={{ margin: 0, fontWeight: "600", color: "#475569" }}>PackYatra Packers &amp; Movers</p>
                  <p style={{ margin: "2px 0 0 0" }}>E-Invoice Verification System • Secure Logistics</p>
                </div>
              </div>
            ) : (
              <div style={{
                padding: "80px 20px", textAlign: "center", color: "var(--muted)",
                background: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: "10px"
              }}>
                <ReceiptText size={32} style={{ marginBottom: 12, opacity: 0.3, margin: "0 auto 12px auto" }} />
                <h4 style={{ margin: 0, fontWeight: 700, color: "var(--ink)", fontSize: "14.5px" }}>No Active Invoice Preview</h4>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>
                  Enter a GC quotation number on the left to generate or retrieve an invoice record.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
