import { useState } from 'react'
import Quotation from './Quotation'
import Invoice from './Invoice'
import { FileText, Receipt } from 'lucide-react'

export default function Reports() {
  const [activeTab, setActiveTab] = useState('quotation')

  return (
    <div className="reports-container" id="reportsPage">
      <style>{`
        #reportsPage {
          font-family: 'Inter', sans-serif;
          color: #0f172a;
          min-height: 100%;
        }

        /* Elegant Formal Header */
        #reportsPage .reports-header {
          margin-bottom: 28px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 20px;
        }

        #reportsPage .reports-meta {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          color: #2563eb;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        #reportsPage .reports-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px;
          letter-spacing: -0.5px;
        }

        #reportsPage .reports-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }

        /* Segmented Controller (Extremely Formal Tabs) */
        #reportsPage .tabs-wrapper {
          display: flex;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          margin-bottom: 24px;
          max-width: 480px;
        }

        #reportsPage .tab-trigger {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          font-size: 13.5px;
          font-weight: 600;
          color: #64748b;
          background: transparent;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        #reportsPage .tab-trigger:hover {
          color: #0f172a;
        }

        #reportsPage .tab-trigger.active {
          background: #ffffff;
          color: #2563eb;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04);
        }

        #reportsPage .tab-panel {
          animation: reportsFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes reportsFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="reports-header">
        <div className="reports-meta">OPERATIONS & INTEL</div>
        <h1 className="reports-title">Reports & Analytics</h1>
        <p className="reports-subtitle">Track, generate, and edit digital quotation sheets and commercial invoice logs.</p>
      </div>

      <div className="tabs-wrapper">
        <button
          className={`tab-trigger ${activeTab === 'quotation' ? 'active' : ''}`}
          onClick={() => setActiveTab('quotation')}
        >
          <FileText size={16} />
          <span>Quotations</span>
        </button>

        <button
          className={`tab-trigger ${activeTab === 'invoice' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoice')}
        >
          <Receipt size={16} />
          <span>Invoices</span>
        </button>
      </div>

      <div className="tab-panel">
        {activeTab === 'quotation' && <Quotation />}
        {activeTab === 'invoice' && <Invoice />}
      </div>
    </div>
  )
}
