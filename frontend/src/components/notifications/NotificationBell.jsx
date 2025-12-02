import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell } from 'lucide-react';
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../ui/popover'
import NotificationDropdown from './NotificationDropdown';
import { fetchUnreadCount } from '../../store/thunks/employeeSelfServiceThunks';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useSelector((state) => state.notifications);

  // Fetch unread count on mount and every 30 seconds
  useEffect(() => {
    dispatch(fetchUnreadCount());
    
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <NotificationDropdown onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
