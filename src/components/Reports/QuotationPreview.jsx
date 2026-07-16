export default function QuotationPreview({ data }) {
  if (!data) return null;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>Quotation Details</h2>
        <span style={styles.amount}>₹ {data.totalAmount}</span>
      </div>

      <div style={styles.section}>
        <div style={styles.row}>
          <div>
            <p style={styles.label}>Customer Name</p>
            <p style={styles.value}>{data.customerName}</p>
          </div>

          <div>
            <p style={styles.label}>Phone</p>
            <p style={styles.value}>{data.phone}</p>
          </div>
        </div>

        <div style={styles.row}>
          <div>
            <p style={styles.label}>Pickup Date</p>
            <p style={styles.value}>{data.pickupDate}</p>
          </div>
        </div>

        <div style={styles.row}>
          <div>
            <p style={styles.label}>From</p>
            <p style={styles.value}>{data.fromAddress}</p>
          </div>
        </div>

        <div style={styles.row}>
          <div>
            <p style={styles.label}>To</p>
            <p style={styles.value}>{data.toAddress}</p>
          </div>
        </div>
      </div>

      <div style={styles.itemsSection}>
        <h3 style={styles.itemsTitle}>Items</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Item Name</th>
              <th style={styles.th}>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {data.items?.map((item, index) => (
              <tr key={index}>
                <td style={styles.td}>{item.name}</td>
                <td style={styles.td}>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===========================
   STYLES
=========================== */

const styles = {
  card: {
    marginTop: "20px",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    backgroundColor: "#ffffff",
    maxWidth: "800px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  title: {
    margin: 0,
    fontSize: "22px",
  },
  amount: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#28a745",
  },
  section: {
    marginBottom: "20px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "15px",
    gap: "20px",
    flexWrap: "wrap",
  },
  label: {
    margin: 0,
    fontSize: "12px",
    color: "#888",
    textTransform: "uppercase",
  },
  value: {
    margin: "5px 0 0 0",
    fontSize: "15px",
    fontWeight: "500",
  },
  itemsSection: {
    marginTop: "20px",
  },
  itemsTitle: {
    marginBottom: "10px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "10px",
    backgroundColor: "#f5f5f5",
    fontSize: "14px",
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
  },
};
