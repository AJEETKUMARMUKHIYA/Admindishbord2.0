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

  const recordsPerPage = 15;

  const handleUpdateTicket = async () => {
    if (!selectedBookingId) {
      setUpdateMessage("Please select a booking first.");
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
        setUpdateMessage("Updated successfully!");
        fetchData();
      } else {
        setUpdateMessage(response.data?.message || "Update failed");
      }
    } catch (error) {
      console.error(error);
      setUpdateMessage("Something went wrong.");
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
      setError("Something went wrong");
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

  return (
    <div
      id="quotationPage"
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
        #quotationPage {
          --ink: #12151C;
          --paper: #F5F6F4;
          --line: #E3E5E1;
          --accent: #2952E3;
          --accent-soft: #EAEFFD;
          --amber: #C67C1F;
          --amber-soft: #FAF0E1;
          --success: #1E8E5A;
          --success-soft: #E8F5EE;
          --danger: #C6403E;
          --danger-soft: #FBEAEA;
          --muted: #6B7280;
        }
        #quotationPage .qp-card { background: #fff; border: 1px solid var(--line); border-radius: 14px; }
        #quotationPage .qp-btn { font-family: 'Inter', sans-serif; font-weight: 600; font-size: 13.5px; border-radius: 9px; padding: 10px 18px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; border: 1px solid transparent; transition: all 0.15s ease; white-space: nowrap; }
        #quotationPage .qp-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        #quotationPage .qp-btn-ghost { background: #fff; border-color: var(--line); color: var(--ink); }
        #quotationPage .qp-btn-ghost:hover:not(:disabled) { border-color: var(--ink); }
        #quotationPage .qp-btn-accent { background: var(--accent); color: #fff; }
        #quotationPage .qp-btn-accent:hover:not(:disabled) { background: #2141c2; }
        #quotationPage .qp-btn-success { background: var(--success); color: #fff; }
        #quotationPage .qp-btn-success:hover:not(:disabled) { background: #17724a; }
        #quotationPage .qp-input, #quotationPage .qp-select { width: 100%; box-sizing: border-box; border: 1px solid var(--line); border-radius: 9px; padding: 10px 12px; font-family: 'Inter', sans-serif; font-size: 14px; color: var(--ink); background: #fff; }
        #quotationPage .qp-input:focus, #quotationPage .qp-select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
        #quotationPage .qp-label { display: block; font-size: 12.5px; font-weight: 600; color: var(--muted); margin-bottom: 6px; }
        #quotationPage .qp-row:hover { background: #FAFBFC; }
        #quotationPage .qp-icon-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--line); background: #fff; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: var(--accent); transition: all 0.15s ease; }
        #quotationPage .qp-icon-btn:hover { border-color: var(--accent); }
        #quotationPage .qp-page-btn { min-width: 32px; height: 32px; padding: 0 8px; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid var(--line); background: #fff; color: var(--ink); }
        #quotationPage .qp-page-btn.active { background: var(--ink); border-color: var(--ink); color: #fff; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "var(--accent)", fontWeight: 500, letterSpacing: 0.4, marginBottom: 6 }}>
            BOOKINGS
          </div>
          <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 30, fontWeight: 700, margin: 0, letterSpacing: -0.4 }}>
            Quotations
          </h1>
        </div>
        <button className="qp-btn qp-btn-ghost" onClick={fetchData}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Search Section */}
      <div className="qp-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <FileSearch size={18} color="var(--accent)" />
          <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 17, fontWeight: 700, margin: 0 }}>
            Search quotation
          </h3>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 240px" }}>
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
            <Search size={15} /> {loading ? "Searching…" : "Search"}
          </button>

          <button
            type="button"
            className="qp-btn qp-btn-success"
            onClick={handleDownload}
            disabled={!quotation}
          >
            <FileDown size={15} /> Download PDF
          </button>
        </div>

        {error && (
          <div style={{
            marginTop: 16, display: "flex", alignItems: "center", gap: 8,
            padding: "10px 14px", borderRadius: 9, background: "var(--danger-soft)",
            color: "var(--danger)", fontSize: 13.5, fontWeight: 500,
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
      </div>

      {quotation && (
        <div className="qp-card" style={{ padding: 24, marginBottom: 20 }}>
          <QuotationPreview data={quotation} />
        </div>
      )}

      {/* Update Ticket Section */}
      <div className="qp-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <Pencil size={17} color="var(--accent)" />
          <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 17, fontWeight: 700, margin: 0 }}>
            Update ticket amount &amp; status
          </h3>
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label className="qp-label">Booking ID</label>
            <input
              type="text"
              className="qp-input"
              value={selectedBookingId || ""}
              readOnly
              placeholder="Select from table below"
              style={{ fontFamily: "IBM Plex Mono, monospace", background: "#FAFBFA", color: "var(--muted)" }}
            />
          </div>

          <div style={{ flex: "1 1 200px" }}>
            <label className="qp-label">Amount</label>
            <input
              type="number"
              className="qp-input"
              value={updateAmount}
              onChange={(e) => setUpdateAmount(e.target.value)}
              placeholder="Enter new amount"
            />
          </div>

          <div style={{ flex: "1 1 200px" }}>
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
        </div>

        <div style={{ marginTop: 18 }}>
          <button className="qp-btn qp-btn-accent" onClick={handleUpdateTicket}>
            <CheckCircle2 size={15} /> Update booking
          </button>
        </div>

        {updateMessage && (
          <div style={{
            marginTop: 14, padding: "10px 14px", borderRadius: 9,
            background: "var(--accent-soft)", color: "var(--accent)",
            fontSize: 13.5, fontWeight: 500,
          }}>
            {updateMessage}
          </div>
        )}
      </div>

      {/* Bottom Grid */}
      <div className="qp-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 17, fontWeight: 700, margin: 0 }}>
              All quotations
            </h3>
            <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "var(--muted)" }}>
              {filteredTickets.length === 0
                ? `0 of ${tickets.length}`
                : `${indexOfFirst + 1}–${Math.min(indexOfLast, filteredTickets.length)} of ${filteredTickets.length}`}
            </span>
          </div>
          <div style={{ position: "relative", maxWidth: 360 }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            <input
              type="text"
              className="qp-input"
              style={{ paddingLeft: 34 }}
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
            <Inbox size={28} style={{ marginBottom: 10, opacity: 0.5 }} />
            <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>No data found</div>
            <div style={{ fontSize: 13.5 }}>Try a different quotation number.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: "#FAFBFA" }}>
                  {["Quotation Number", "Amount", "Date", ""].map((h, i) => (
                    <th key={i} style={{
                      textAlign: h === "" ? "right" : "left", padding: "10px 24px", fontSize: 11.5,
                      fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: "var(--muted)",
                      borderBottom: "1px solid var(--line)",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((item, index) => (
                  <tr key={index} className="qp-row" style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "12px 24px", fontFamily: "IBM Plex Mono, monospace", fontWeight: 600 }}>
                      {item.quotationNumber}
                    </td>
                    <td style={{ padding: "12px 24px", fontWeight: 600 }}>
                      ₹ {item.totalAmount}
                    </td>
                    <td style={{ padding: "12px 24px", color: "var(--muted)" }}>
                      {item.pickupDate ? new Date(item.pickupDate).toLocaleDateString() : "-"}
                    </td>
                    <td style={{ padding: "12px 24px", textAlign: "right" }}>
                      <button
                        className="qp-icon-btn"
                        title="Update this booking"
                        onClick={() => {
                          setSelectedBookingId(item.bookingID);
                          setUpdateAmount(item.totalAmount);
                          setUpdateStatus(item.status);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <Pencil size={14} />
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
            padding: "14px 24px", borderTop: "1px solid var(--line)", flexWrap: "wrap", gap: 12,
          }}>
            <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
              Page <strong style={{ color: "var(--ink)" }}>{currentPage}</strong> of {totalPages}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                className="qp-icon-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                style={{ opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                title="Previous page"
              >
                <ChevronLeft size={14} />
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
                    <span key={p} style={{ padding: "0 4px", color: "var(--muted)", fontSize: 13 }}>…</span>
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
                className="qp-icon-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                style={{ opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                title="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}