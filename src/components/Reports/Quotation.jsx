import { useState, useEffect } from "react";
import { getQuotationByNumber } from "../../services/dashboardService";
import { mapQuotationToViewModel } from "../../utils/quotationMapper";
import QuotationPreview from "../Reports/QuotationPreview.jsx";
import { generateBookingConfirmationPDF } from "../../utils/generateBookingConfirmationPDF";
import axiosClient from "../../AxiosClient";
import config from "../../config";
import {
  RefreshCw,
  Search,
  FileDown,
  FileSearch,
  Pencil,
  Inbox,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Quotation() {
  const [number, setNumber] = useState("");
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [updateAmount, setUpdateAmount] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  const recordsPerPage = 10;

  const handleUpdateTicket = async () => {
    if (!selectedBookingId) {
      setUpdateMessage("Please select a booking from the table first.");
      return;
    }

    if (!updateAmount && !updateStatus) {
      setUpdateMessage("Provide amount or status to update.");
      return;
    }

    try {
      const payload = {
        bookingID: selectedBookingId,
        totalAmount: updateAmount ? parseFloat(updateAmount) : null,
        bookingStatus: updateStatus || null,
      };

      const response = await axiosClient.post(
        config.urls.dashboardUpdateBookings,
        payload
      );

      if (response.data?.success) {
        setUpdateMessage("Quotation updated successfully!");
        fetchData();
        
        // If currently previewing the updated quotation, refresh the preview as well
        if (quotation && quotation.quotationNumber === selectedBookingId) {
          handleSearch();
        }
      } else {
        setUpdateMessage(response.data?.message || "Update failed");
      }
    } catch (error) {
      console.error(error);
      setUpdateMessage("Something went wrong during update.");
    }
  };

  const handleSearch = async () => {
    if (!number) {
      setError("Please enter quotation number");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getQuotationByNumber(number);

      if (!response.success) {
        setError(response.message);
        setQuotation(null);
        return;
      }

      const mapped = mapQuotationToViewModel(response.data);
      setQuotation(mapped);
    } catch (err) {
      setError("Something went wrong during search.");
      setQuotation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!quotation) return;
    await generateBookingConfirmationPDF(quotation);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axiosClient.get(
        config.urls.dashboardRecentBookings
      );

      if (response.data?.data) return response.data.data;
      if (Array.isArray(response.data)) return response.data;

      return [];
    } catch (error) {
      console.error("Error fetching tickets:", error);
      return [];
    }
  };

  const fetchData = async () => {
    const ticketsData = await fetchTickets();
    setTickets(ticketsData);
  };

  const filteredTickets = tickets.filter((item) =>
    item.quotationNumber
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredTickets.slice(
    indexOfFirst,
    indexOfLast
  );

  const totalPages = Math.ceil(
    filteredTickets.length / recordsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "paid") {
      return <span className="qp-status-badge status-paid">Paid</span>;
    } else if (s === "pending") {
      return <span className="qp-status-badge status-pending">Pending</span>;
    } else if (s === "partial") {
      return <span className="qp-status-badge status-partial">Partial</span>;
    } else if (s === "cancelled" || s === "cancel") {
      return <span className="qp-status-badge status-cancelled">Cancelled</span>;
    }
    return <span className="qp-status-badge">{status || "Pending"}</span>;
  };

  return (
    <div id="quotationPage" className="quotation-module">
      <style>{`
        #quotationPage {
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

        #quotationPage .quotation-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        @media (min-width: 1024px) {
          #quotationPage .quotation-grid {
            grid-template-columns: repeat(12, minmax(0, 1fr));
          }
          #quotationPage .col-left {
            grid-column: span 7;
          }
          #quotationPage .col-right {
            grid-column: span 5;
          }
        }

        #quotationPage .qp-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03), 0 1px 2px rgba(15, 23, 42, 0.02);
          overflow: hidden;
        }

        #quotationPage .qp-card-header {
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fafafa;
        }

        #quotationPage .qp-card-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        #quotationPage .qp-card-body {
          padding: 20px;
        }

        /* Pristine buttons */
        #quotationPage .qp-btn {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 13px;
          border-radius: 8px;
          padding: 9px 16px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid transparent;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        #quotationPage .qp-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        #quotationPage .qp-btn-ghost {
          background: #ffffff;
          border-color: #cbd5e1;
          color: #334155;
        }

        #quotationPage .qp-btn-ghost:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #94a3b8;
          color: #0f172a;
        }

        #quotationPage .qp-btn-accent {
          background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
          color: #ffffff;
          border: none;
        }

        #quotationPage .qp-btn-accent:hover:not(:disabled) {
          opacity: 0.95;
          transform: translateY(-1px);
        }

        #quotationPage .qp-btn-success {
          background: var(--success);
          color: #ffffff;
        }

        #quotationPage .qp-btn-success:hover:not(:disabled) {
          background: #15803d;
        }

        /* Sleek form fields */
        #quotationPage .qp-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }

        #quotationPage .qp-label {
          font-size: 11.5px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        #quotationPage .qp-input, #quotationPage .qp-select {
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

        #quotationPage .qp-input:focus, #quotationPage .qp-select:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        /* Status badges */
        #quotationPage .qp-status-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 9999px;
          font-size: 11.5px;
          font-weight: 600;
          text-transform: capitalize;
          border: 1px solid #e2e8f0;
          background: #f1f5f9;
          color: #475569;
        }

        #quotationPage .status-paid {
          background: var(--success-soft);
          color: var(--success);
          border-color: #bbf7d0;
        }

        #quotationPage .status-pending {
          background: var(--amber-soft);
          color: var(--amber);
          border-color: #fde68a;
        }

        #quotationPage .status-partial {
          background: var(--accent-soft);
          color: var(--accent);
          border-color: #bfdbfe;
        }

        #quotationPage .status-cancelled {
          background: var(--danger-soft);
          color: var(--danger);
          border-color: #fca5a5;
        }

        /* Custom Table */
        #quotationPage .qp-table-wrapper {
          overflow-x: auto;
          border-top: 1px solid var(--line);
        }

        #quotationPage .qp-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }

        #quotationPage .qp-th {
          padding: 12px 18px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: var(--muted);
          background: #fafafa;
          border-bottom: 1px solid var(--line);
          text-align: left;
        }

        #quotationPage .qp-td {
          padding: 14px 18px;
          border-bottom: 1px solid var(--line);
          color: var(--ink);
          vertical-align: middle;
        }

        #quotationPage .qp-row {
          transition: background-color 0.15s ease;
        }

        #quotationPage .qp-row:hover {
          background-color: #f8fafc;
        }

        #quotationPage .qp-icon-btn {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--accent);
          transition: all 0.15s ease;
        }

        #quotationPage .qp-icon-btn:hover {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        #quotationPage .qp-page-btn {
          min-width: 30px;
          height: 30px;
          padding: 0 8px;
          border-radius: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          transition: all 0.15s ease;
        }

        #quotationPage .qp-page-btn:hover {
          border-color: #94a3b8;
          background: #f8fafc;
        }

        #quotationPage .qp-page-btn.active {
          background: #0f172a;
          border-color: #0f172a;
          color: #ffffff;
        }
      `}</style>

      {/* Grid of controllers */}
      <div className="quotation-grid">
        {/* Left Card: Search & preview */}
        <div className="col-left qp-card">
          <div className="qp-card-header">
            <FileSearch size={16} className="text-blue-600" />
            <h3 className="qp-card-title">Search & Export Quotation</h3>
          </div>
          <div className="qp-card-body">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: "1 1 200px" }} className="qp-input-wrapper">
                <label className="qp-label">Quotation number</label>
                <input
                  type="text"
                  className="qp-input"
                  value={number}
                  onChange={(e) => setNumber(e.target.value.trimStart())}
                  placeholder="e.g. QTN-10234"
                />
              </div>

              <button
                type="button"
                className="qp-btn qp-btn-accent"
                onClick={handleSearch}
                disabled={loading || !number.trim()}
              >
                <Search size={14} /> {loading ? "Searching…" : "Search"}
              </button>

              <button
                type="button"
                className="qp-btn qp-btn-success"
                onClick={handleDownload}
                disabled={!quotation}
              >
                <FileDown size={14} /> Export PDF
              </button>
            </div>

            {error && (
              <div style={{
                marginTop: 14, display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderRadius: 8, background: "var(--danger-soft)",
                color: "var(--danger)", fontSize: 13, fontWeight: 500,
              }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Update ticket */}
        <div className="col-right qp-card">
          <div className="qp-card-header">
            <Pencil size={15} className="text-amber-600" />
            <h3 className="qp-card-title">Quick Status & Amount Adjust</h3>
          </div>
          <div className="qp-card-body">
            <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div className="qp-input-wrapper">
                  <label className="qp-label">Booking ID</label>
                  <input
                    type="text"
                    className="qp-input"
                    value={selectedBookingId || ""}
                    readOnly
                    placeholder="Select row below"
                    style={{ background: "#f8fafc", color: "var(--muted)", fontWeight: "500", cursor: "not-allowed" }}
                  />
                </div>

                <div className="qp-input-wrapper">
                  <label className="qp-label">New Amount (₹)</label>
                  <input
                    type="number"
                    className="qp-input"
                    value={updateAmount}
                    onChange={(e) => setUpdateAmount(e.target.value)}
                    placeholder="e.g. 15000"
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                <div className="qp-input-wrapper">
                  <label className="qp-label">Status</label>
                  <select
                    className="qp-select"
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                  >
                    <option value="">Select status</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <button className="qp-btn qp-btn-accent" style={{ height: "38px" }} onClick={handleUpdateTicket}>
                  <CheckCircle2 size={14} /> Update
                </button>
              </div>
            </div>

            {updateMessage && (
              <div style={{
                marginTop: 12, padding: "8px 12px", borderRadius: 8,
                background: updateMessage.includes("successfully") ? "var(--success-soft)" : "var(--accent-soft)",
                color: updateMessage.includes("successfully") ? "var(--success)" : "var(--accent)",
                fontSize: 13, fontWeight: 500,
              }}>
                {updateMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {quotation && (
        <div className="qp-card" style={{ marginBottom: 24 }}>
          <QuotationPreview data={quotation} />
        </div>
      )}

      {/* Main Table Card */}
      <div className="qp-card">
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                All Quotations Ledger
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "var(--muted)" }}>
                Overview of booked moving records. Select any row to quickly edit.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11.5, color: "var(--muted)", fontWeight: "600" }}>
                {filteredTickets.length === 0
                  ? `0 of ${tickets.length}`
                  : `${indexOfFirst + 1}–${Math.min(indexOfLast, filteredTickets.length)} of ${filteredTickets.length}`}
              </span>
              <button className="qp-btn qp-btn-ghost" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={fetchData}>
                <RefreshCw size={13} /> Sync Ledger
              </button>
            </div>
          </div>
          
          <div style={{ position: "relative", maxWidth: 360 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            <input
              type="text"
              className="qp-input"
              style={{ paddingLeft: 34, height: "36px", fontSize: "13px" }}
              placeholder="Search by quotation number…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {currentRecords.length === 0 ? (
          <div style={{ padding: "56px 20px", textAlign: "center", color: "var(--muted)" }}>
            <Inbox size={28} style={{ marginBottom: 10, opacity: 0.5, margin: "0 auto 10px auto" }} />
            <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>No quotations found</div>
            <div style={{ fontSize: 13 }}>Try searching for a different quotation code.</div>
          </div>
        ) : (
          <div className="qp-table-wrapper">
            <table className="qp-table">
              <thead>
                <tr>
                  <th className="qp-th">Quotation Number</th>
                  <th className="qp-th">GC Number</th>
                  <th className="qp-th">Booking ID</th>
                  <th className="qp-th">Amount</th>
                  <th className="qp-th">Date</th>
                  <th className="qp-th">Status</th>
                  <th className="qp-th" style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((item, index) => (
                  <tr key={index} className="qp-row">
                    <td className="qp-td" style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 600, color: "var(--accent)" }}>
                      {item.quotationNumber}
                    </td>
                    <td className="qp-td" style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 500 }}>
                      {item.invoiceNumber || "-" }
                    </td>
                     <td className="qp-td" style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 500 }}>
                      {item.bookingID}
                    </td>
                    <td className="qp-td" style={{ fontWeight: 600 }}>
                      ₹ {item.totalAmount?.toLocaleString() || "0"}
                    </td>
                    <td className="qp-td" style={{ color: "var(--muted)" }}>
                      {item.pickupDate ? new Date(item.pickupDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "-"}
                    </td>
                    <td className="qp-td">
                      {renderStatusBadge(item.status)}
                    </td>
                    <td className="qp-td" style={{ textAlign: "right" }}>
                      <button
                        className="qp-icon-btn"
                        title="Click to load edit values"
                        onClick={() => {
                          setSelectedBookingId(item.bookingID);
                          setUpdateAmount(item.totalAmount || "");
                          setUpdateStatus(item.status || "");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <Pencil size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 20px", borderTop: "1px solid var(--line)", flexWrap: "wrap", gap: 12,
          }}>
            <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
              Page <strong style={{ color: "var(--ink)" }}>{currentPage}</strong> of {totalPages}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                className="qp-page-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                style={{ opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                title="Previous page"
              >
                <ChevronLeft size={13} />
              </button>

              {[...Array(totalPages)]
                .map((_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push(`ellipsis-${p}`);
                  acc.push(p);
                  return acc;
                }, [])
                .map((p) =>
                  typeof p === "string" ? (
                    <span key={p} style={{ padding: "0 4px", color: "var(--muted)", fontSize: 12 }}>…</span>
                  ) : (
                    <button
                      key={p}
                      className={`qp-page-btn ${currentPage === p ? "active" : ""}`}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                className="qp-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                style={{ opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                title="Next page"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
