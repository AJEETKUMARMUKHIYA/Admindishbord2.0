const Settings = {
    DATE_RANGE_PICKER_INPUT_FORMAT: 'dd-MMM-yyyy',
    DISPLAY_SERVICE_PERIOD_DATE_FORMAT: 'MMM yyyy',
    DISPLAY_DATE_FORMAT: 'dd-MMM-yyyy',
    CHINA_DISPLAY_DATE_FORMAT: 'DD/MM/YYYY',
    DATE_FORMAT: 'yyyy-MM-DD',
  
    ROLE_SITE_USER: 'Site User',
    ROLE_ACCOUNT_MANAGER: 'Account Manager',
    ROLE_FSC: 'FSC',
    ROLE_HEAD_FINANCE: 'Head finance',
    ROLE_CLIENT_FINANCE: 'Client Finance',
    ROLE_ADMIN: 'Admin',
  
    statusColors: {
      Composing: '#003f5c',
      Submitted: '#d86711',
      Acknowledged: 'hsl(170, 70%, 58%)',
      'PO Generated': '#888ddf',
      'GR Generated': '#8C84c9',
      'Billing Generated': '#b23f72',
      'Pending Approval': '#890A5B',
      Cancelled: '#FF8057',
    },
  
    COMPOSING_STATUS: 'Composing',
    SUBMITTED_STATUS: 'Submitted',
    ACKNOWLEDGED_STATUS: 'Acknowledged',
    PO_GENERATED_STATUS: 'PO Generated',
    GR_GENERATED_STATUS: 'GR Generated',
    APPROVED_STATUS: 'Approved',
    PENDING_APPROVAL_STATUS: 'Pending Approval',
    BILLING_GENERATED_STATUS: 'Billing Generated',
  
    DEFAULT_SUPPLIER_ID: -1,
    DEFAULT_PAYMENT_TERM_ID: -1,
    DEFAULT_BLR_ITEM_CATEGORY_ID: -1,
    DEFAULT_TAXRATE_ID: -1,
    DEFAULT_REQUEST_FROM_DATE: '2022-01-01',
    DEFAULT_TRANSACTION_FROM_DATE: '2000-01-01',
    DEBOUNCE_DELAY: 500,
    MAX_FILE_SIZE: 20,
    REJECTED_STATUS: 'Rejected',
  
    chartColors: {
      Committed: '#6c8ab4',
      Received: 'rgb(244, 117, 96)',
      Open: 'hsl(180, 70%, 58%)',
      GRNV: '#b23f72',
      'Other GR': '#888ddf',
      Invoiced: '#8C84c9',
      'Not Invoiced': '#d86711',
      Compliant: '#006D2C',
      'Non Compliant': '#B30000',
      'Compliant Taxable Amount': '#BB6D2C',
      'Compliant Tax Amount': '#0288436',
      'Non Compliant Taxable Amount': '#B30000',
      'Non Compliant Tax Amount': '#bb1a1a',
    },
  
    DATA_YEAR: 2020,
    MAX_EXPORT_ROWS: 10000,
  };
  
  export default Settings;
  