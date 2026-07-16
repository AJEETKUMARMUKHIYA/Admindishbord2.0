import { CheckCircle, Circle, Clock } from 'lucide-react';

export function Timeline({ timeline, status }) {
  const events = [
    {
      label: 'Order Created',
      timestamp: timeline.created,
      completed: true
    },
    {
      label: 'Driver Assigned',
      timestamp: timeline.assigned,
      completed: !!timeline.assigned
    },
    {
      label: 'Order Picked Up',
      timestamp: timeline.picked,
      completed: !!timeline.picked
    },
    {
      label: 'In Transit',
      timestamp: timeline.inTransit,
      completed: !!timeline.inTransit
    },
    {
      label: 'Delivered',
      timestamp: timeline.delivered,
      completed: !!timeline.delivered
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-gray-900 mb-6">Delivery Timeline</h2>
      
      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                event.completed 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {event.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              {index < events.length - 1 && (
                <div className={`w-0.5 h-12 ${
                  event.completed ? 'bg-green-200' : 'bg-gray-200'
                }`} />
              )}
            </div>
            
            <div className="flex-1 pb-6">
              <div className="flex items-center justify-between mb-1">
                <p className={`${
                  event.completed ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {event.label}
                </p>
                {event.timestamp && (
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Clock className="w-4 h-4" />
                    {new Date(event.timestamp).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>
              {!event.timestamp && (
                <p className="text-gray-500 text-sm">Pending</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}