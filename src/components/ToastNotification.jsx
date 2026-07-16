import { Toaster, toast } from 'sonner';
import './ToastNotification.css';

// Custom toast functions
export const showToast = {
  // Success toast
  success: (message, options = {}) => {
    return toast.success(message, {
      duration: 3000,
      position: 'top-right',
      className: 'sonner-toast-success',
      ...options
    });
  },

  // Error toast
  error: (message, options = {}) => {
    return toast.error(message, {
      duration: 5000,
      position: 'top-right',
      className: 'sonner-toast-error',
      ...options
    });
  },

  // Warning toast
  warning: (message, options = {}) => {
    return toast.warning(message, {
      duration: 4000,
      position: 'top-right',
      className: 'sonner-toast-warning',
      ...options
    });
  },

  // Info toast
  info: (message, options = {}) => {
    return toast.info(message, {
      duration: 3000,
      position: 'top-right',
      className: 'sonner-toast-info',
      ...options
    });
  },

  // Loading toast
  loading: (message = "Loading...", options = {}) => {
    return toast.loading(message, {
      position: 'top-right',
      className: 'sonner-toast-loading',
      ...options
    });
  },

  // Custom toast
  custom: (message, options = {}) => {
    return toast(message, {
      duration: 3000,
      position: 'top-right',
      ...options
    });
  },

  // Dismiss toast
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  }
};

// Toast container component
const ToastNotification = () => {
  return (
    <Toaster
      position="top-right"
      expand={false}
      visibleToasts={5}
      richColors
      closeButton
      theme="light"
      toastOptions={{
        className: 'sonner-toast',
        style: {
          fontFamily: "'Inter', sans-serif",
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          border: 'none',
          padding: '16px',
          margin: '8px',
          maxWidth: '380px',
        }
      }}
    />
  );
};

export default ToastNotification;