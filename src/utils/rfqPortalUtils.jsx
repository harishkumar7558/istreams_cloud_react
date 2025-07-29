import { AlertCircle, AlertTriangle, Clock, CalendarCheck, Info, X, CalendarDays } from "lucide-react";

const getExpirationStatus = (expirationDate) => {
  if (!expirationDate) return { 
    status: 'No date', 
    badgeClass: 'bg-gray-100 text-gray-600',
    borderClass: 'border-l-gray-500',
    icon: <Info className="h-4 w-4" />,
    daysText: 'No deadline'
  };
  
  const now = new Date();
  const expDate = new Date(expirationDate);
  
  // Reset time components to compare only dates
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const expiryDate = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
  
  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { 
      status: 'Expired', 
      badgeClass: 'bg-red-100 text-red-600',
      borderClass: 'border-l-red-500',
      icon: <X className="h-4 w-4" />,
      daysText: 'Submission closed'
    };
  } else if (diffDays === 0) {
    return { 
      status: 'Due today', 
      badgeClass: 'bg-red-100 text-red-600',
      borderClass: 'border-l-red-500',
      icon: <AlertCircle className="h-4 w-4" />,
      daysText: 'Last day to submit'
    };
  } else if (diffDays === 1) {
    return { 
      status: 'Due tomorrow', 
      badgeClass: 'bg-orange-100 text-orange-600',
      borderClass: 'border-l-orange-500',
      icon: <AlertTriangle className="h-4 w-4" />,
      daysText: 'Expiring soon'
    };
  } else if (diffDays <= 3) {
    return { 
      status: `Due in ${diffDays} days`, 
      badgeClass: 'bg-orange-100 text-orange-600',
      borderClass: 'border-l-orange-500',
      icon: <Clock className="h-4 w-4" />,
      daysText: `${diffDays} days left`
    };
  } else if (diffDays <= 7) {
    return { 
      status: `Due in ${diffDays} days`, 
      badgeClass: 'bg-blue-100 text-blue-600',
      borderClass: 'border-l-blue-500',
      icon: <CalendarDays className="h-4 w-4" />,
      daysText: `${diffDays} days left`
    };
  } else {
    return { 
      status: `Due in ${diffDays} days`, 
      badgeClass: 'bg-green-100 text-green-600',
      borderClass: 'border-l-green-500',
      icon: <CalendarCheck className="h-4 w-4" />,
      daysText: 'Active'
    };
  }
};

export default getExpirationStatus;