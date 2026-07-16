export default function QuotationPreview({ data }) {
  if (!data) return null;

  return (
    <div style={styles.card}>
      <style>{`
        .qpv-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          margin-top: 12px;
        }
        .qpv-th {
          text-align: left;
          padding: 10px 14px;
          background-color: #f8fafc;
          color: #475569;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0;
        }
        .qpv-td {
          padding: 10px 14px;
          border-bottom: 1px solid #e2e8f0;
          color: #1e293b;
        }
        .qpv-row:hover {
          background-color: #fafafa;
        }
      `}</style>

      {/* Corporate Letterhead style */}
      <div style={styles.header}>
        <div>
          <span style={styles.meta}>OFFICIAL INVENTORY ESTIMATE</span>
          <h2 style={styles.title}>Quotation Summary</h2>
          <span style={styles.quotationNumber}>{data.quotationNumber}</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Estimated Amount</p>
          <span style={styles.amount}>₹ {data.totalAmount?.toLocaleString() || "0"}</span>
        </div>
      </div>

      {/* 2-Column Details Layout */}
      <div style={styles.section}>
        <div style={styles.grid}>
          <div style={styles.fieldBox}>
            <p style={styles.label}>Customer Name</p>
            <p style={styles.value}>{data.customerName || "—"}</p>
          </div>

          <div style={styles.fieldBox}>
            <p style={styles.label}>Contact Phone</p>
            <p style={styles.value}>{data.phone || "—"}</p>
          </div>

          <div style={styles.fieldBox}>
            <p style={styles.label}>Scheduled Pickup Date</p>
            <p style={styles.value}>{data.pickupDate ? new Date(data.pickupDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}</p>
          </div>

          <div style={styles.fieldBox}>
            <p style={styles.label}>Moving Service</p>
            <p style={styles.value}>PackYatra Logistics &amp; Moving</p>
          </div>
        </div>

        {/* Full-width fields */}
        <div style={{ ...styles.fieldBox, marginTop: "12px" }}>
          <p style={styles.label}>Origin Address (From)</p>
          <p style={styles.value}>{data.fromAddress || "—"}</p>
        </div>

        <div style={{ ...styles.fieldBox, marginTop: "12px" }}>
          <p style={styles.label}>Destination Address (To)</p>
          <p style={styles.value}>{data.toAddress || "—"}</p>
        </div>
      </div>

      {/* Table Section */}
      <div style={styles.itemsSection}>
        <h3 style={styles.itemsTitle}>Itemized Moving List</h3>

        {data.items && data.items.length > 0 ? (
          <table className="qpv-table">
            <thead>
              <tr>
                <th className="qpv-th" style={{ width: "70%" }}>Item Description</th>
                <th className="qpv-th" style={{ textAlign: "right" }}>Volume / Qty</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="qpv-row">
                  <td className="qpv-td" style={{ fontWeight: 500 }}>{item.name}</td>
                  <td className="qpv-td" style={{ textAlign: "right", fontFamily: "IBM Plex Mono, monospace", fontWeight: 600 }}>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "6px", fontSize: "13px", color: "#64748b", textAlign: "center" }}>
            No individual items recorded for this quotation.
          </div>
        )}
      </div>
    </div>
  );
}

/* ===========================
   FORMAL DESIGN STYLES
=========================== */
const styles = {
  card: {
    padding: "24px",
    backgroundColor: "#ffffff",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "16px",
  },
  meta: {
    fontFamily: "IBM Plex Mono, monospace",
    fontSize: "10.5px",
    fontWeight: 700,
    color: "#2563eb",
    letterSpacing: "1px",
    display: "block",
    marginBottom: "4px",
  },
  title: {
    margin: 0,
    fontFamily: "Space Grotesk, sans-serif",
    fontSize: "20px",
    fontWeight: 700,
    color: "#0f172a",
  },
  quotationNumber: {
    fontFamily: "IBM Plex Mono, monospace",
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 600,
    marginTop: "2px",
    display: "inline-block",
  },
  amount: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#0f172a",
    fontFamily: "Inter, sans-serif",
    marginTop: "2px",
    display: "block",
  },
  section: {
    marginBottom: "24px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  fieldBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "10px 14px",
  },
  label: {
    margin: 0,
    fontSize: "10px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  value: {
    margin: "4px 0 0 0",
    fontSize: "13.5px",
    fontWeight: "600",
    color: "#1e293b",
  },
  itemsSection: {
    marginTop: "24px",
  },
  itemsTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#0f172a",
    fontFamily: "Space Grotesk, sans-serif",
    margin: "0 0 10px 0",
    borderBottom: "2px solid #0f172a",
    paddingBottom: "6px",
  },
};
