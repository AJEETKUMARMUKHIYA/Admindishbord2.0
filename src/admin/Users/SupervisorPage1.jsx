import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DeliveryDashboard  from '../Users/Supervisor/DeliveryDashboard';
import { TicketDetails } from '../Users/Supervisor/TicketDetails';

export default function SupervisorPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Validate userId
  useEffect(() => {
    const userID = localStorage.getItem('userID');
    
    // If no userId in URL or localStorage, redirect to home
    if (!userId && !userID) {
      navigate('/');
      return;
    }
    
    // If userId in URL doesn't match localStorage, redirect to home
    if (userId && userID && parseInt(userId) !== parseInt(userID)) {
      navigate('/');
      return;
    }
  }, [userId, navigate]);

  const supervisorId = userId ? parseInt(userId) : parseInt(localStorage.getItem('userID') || '0');

  if (!supervisorId) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedTicketId ? (
        <TicketDetails 
          ticketId={selectedTicketId} 
          userId={supervisorId}
          onBack={() => setSelectedTicketId(null)} 
        />
      ) : (
        <DeliveryDashboard 
          userId={supervisorId}
          onSelectTicket={setSelectedTicketId} 
        />
      )}
    </div>
  );
}