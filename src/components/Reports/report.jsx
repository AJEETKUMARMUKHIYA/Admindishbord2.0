import { useState } from 'react'
import Quotation from './Quotation'
import Invoice from './Invoice'

export default function report() {
  const [activeTab, setActiveTab] = useState('quotation')

  return (
    <div className="container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

        .container * {
          box-sizing: border-box;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 24px 64px;
          font-family: 'Inter', sans-serif;
          color: #1a2238;
          background: #f3f5f8;
        }

        /* Header */
        .container .header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 28px;
        }

        .container .header-icon {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, #1a2238, #2c3a5e);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(26, 34, 56, 0.25);
        }

        .container .header-text h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 26px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .container .header-subtitle {
          margin: 4px 0 0;
          font-size: 14px;
          color: #6b7280;
        }

        /* Tabs container */
        .container .tabs-container {
          background: #ffffff;
          border: 1px solid #e3e6ee;
          border-top: 3px solid #e3e6ee;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(20, 24, 40, 0.04);
          transition: border-top-color 0.25s ease;
        }

        .container .tabs-container.accent-quotation {
          border-top-color: #2f7d6b;
        }

        .container .tabs-container.accent-invoice {
          border-top-color: #b8862b;
        }

        /* Tabs header */
        .container .tabs-header {
          display: flex;
          background: #f3f5f8;
          border-bottom: 1px solid #e3e6ee;
          padding: 6px;
          gap: 6px;
        }

        .container .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          background: transparent;
          border: none;
          border-radius: 9px;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
        }

        .container .tab-btn i {
          font-size: 13px;
        }

        .container .tab-btn:hover {
          background: rgba(26, 34, 56, 0.05);
          color: #1a2238;
        }

        .container .tab-btn.quotation-tab.active {
          background: #eaf5f1;
          color: #2f7d6b;
          box-shadow: inset 0 0 0 1px rgba(47, 125, 107, 0.25);
        }

        .container .tab-btn.invoice-tab.active {
          background: #faf2e2;
          color: #b8862b;
          box-shadow: inset 0 0 0 1px rgba(184, 134, 43, 0.25);
        }

        /* Content */
        .container .tab-content {
          padding: 28px;
        }

        @media (max-width: 640px) {
          .container .tabs-header {
            flex-direction: column;
          }

          .container .header {
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="header">
        <div className="header-icon">
          <i className="fas fa-chart-line"></i>
        </div>
        <div className="header-text">
          <h1>Reports & Analytics</h1>
          <p className="header-subtitle">Track quotations and invoices in one place</p>
        </div>
      </div>

      <div className={`tabs-container accent-${activeTab}`}>
        <div className="tabs-header">
          <button
            className={`tab-btn quotation-tab ${activeTab === 'quotation' ? 'active' : ''}`}
            onClick={() => setActiveTab('quotation')}
          >
            <i className="fas fa-file-contract"></i> Quotation Management
          </button>

          <button
            className={`tab-btn invoice-tab ${activeTab === 'invoice' ? 'active' : ''}`}
            onClick={() => setActiveTab('invoice')}
          >
            <i className="fas fa-file-invoice-dollar"></i> Invoice Management
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'quotation' && <Quotation />}
          {activeTab === 'invoice' && <Invoice />}
        </div>
      </div>
    </div>
  )
}