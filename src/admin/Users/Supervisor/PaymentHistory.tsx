import { IndianRupee, CreditCard, Banknote, Smartphone, CheckCircle, Clock, RefreshCw } from 'lucide-react';

export function PaymentHistory({ payment, items }) {
  const paymentMethods = {
    cod: { icon: <Banknote className="w-5 h-5" />, label: 'Cash on Delivery' },
    online: { icon: <Smartphone className="w-5 h-5" />, label: 'Online Payment' },
    card: { icon: <CreditCard className="w-5 h-5" />, label: 'Card Payment' }
  };

  const statusColors = {
    pending: { bg: 'bg-orange-100', text: 'text-orange-800', icon: <Clock className="w-5 h-5" /> },
    paid: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-5 h-5" /> },
    refunded: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <RefreshCw className="w-5 h-5" /> }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% tax
  const deliveryFee = 30;
  const total = subtotal + tax + deliveryFee;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Payment Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-gray-900 mb-6">Payment Details</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {paymentMethods[payment.method].icon}
              <div>
                <p className="text-gray-900">{paymentMethods[payment.method].label}</p>
                <p className="text-gray-600 text-sm">Payment Method</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {statusColors[payment.status].icon}
              <div>
                <p className={`${statusColors[payment.status].text}`}>
                  {payment.status.toUpperCase()}
                </p>
                <p className="text-gray-600 text-sm">Payment Status</p>
              </div>
            </div>
          </div>

          {payment.transactionId && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-1">Transaction ID</p>
              <p className="text-gray-900 font-mono text-sm">{payment.transactionId}</p>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <IndianRupee className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-blue-900">₹{total.toFixed(2)}</p>
                <p className="text-blue-700 text-sm">Total Amount</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-gray-900 mb-6">Bill Breakdown</h2>
        
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start pb-3 border-b border-gray-100">
              <div className="flex-1">
                <p className="text-gray-900">{item.name}</p>
                <p className="text-gray-600 text-sm">Qty: {item.quantity} × ₹{item.price}</p>
              </div>
              <p className="text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}

          <div className="pt-3 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (5%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">₹{total.toFixed(2)}</span>
          </div>
        </div>

        {payment.status === 'pending' && payment.method === 'cod' && (
          <div className="mt-6">
            <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Mark as Collected
            </button>
          </div>
        )}
      </div>
    </div>
  );
}