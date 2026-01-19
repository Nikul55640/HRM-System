import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Timer, 
  Coffee,
  Bell,
  X,
  Building2,
  Home,
  Users,
  MapPin
} from 'lucide-react';
import useAttendanceSessionStore from '../../../stores/useAttendanceSessionStore';

const ShiftStatusWidget = () => {
  const { todayRecord, getAttendanceStatus } = useAttendanceSessionStore();
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // 🏢 NEW: Get work mode icon and label
  const getWorkModeDisplay = (workMode) => {
    switch (workMode) {
      case 'office':
        return { icon: Building2, label: 'Office', color: 'bg-blue-100 text-blue-700' };
      case 'wfh':
        return { icon: Home, label: 'Work From Home', color: 'bg-green-100 text-green-700' };
      case 'hybrid':
        return { icon: Users, label: 'Hybrid', color: 'bg-purple-100 text-purple-700' };
      case 'field':
        return { icon: MapPin, label: 'Field Work', color: 'bg-orange-100 text-orange-700' };
      default:
        return { icon: Building2, label: 'Office', color: 'bg-gray-100 text-gray-700' };
    }
  };

  
  // Generate notifications based on shift status
  useEffect(() => {
    if (!todayRecord?.shift) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const shift = todayRecord.shift;
    const { isClockedIn, isOnBreak } = getAttendanceStatus();
    
    // ✅ Don't show any warnings if already clocked out for the day
    const hasClockedOut = todayRecord.clockOut !== null && todayRecord.clockOut !== undefined;
    if (hasClockedOut) {
      setNotifications([]);
      return;
    }

    const newNotifications = [];

    // Shift start reminder
    const shiftStartTime = new Date(`${today} ${shift.shiftStartTime}`);
    const gracePeriodMs = (shift.gracePeriodMinutes || 0) * 60 * 1000;
    const lateThreshold = new Date(shiftStartTime.getTime() + gracePeriodMs);
    
    // Pre-shift reminder (30 minutes before)
    const preShiftReminder = new Date(shiftStartTime.getTime() - (30 * 60 * 1000));
    
    if (!isClockedIn && now >= preShiftReminder && now < shiftStartTime) {
      newNotifications.push({
        id: 'pre-shift',
        type: 'info',
        title: 'Shift Starting Soon',
        message: `Your shift starts at ${shift.shiftStartTime}. Don't forget to clock in!`,
        icon: Bell,
        dismissible: true
      });
    }

    // Late warning
    if (!isClockedIn && now > lateThreshold) {
      newNotifications.push({
        id: 'late-warning',
        type: 'warning',
        title: 'Late for Shift',
        message: `You are ${Math.floor((now - lateThreshold) / (1000 * 60))} minutes late. Please clock in immediately.`,
        icon: AlertTriangle,
        dismissible: false
      });
    }

    // Shift end reminder
    const shiftEndTime = new Date(`${today} ${shift.shiftEndTime}`);
    const endReminder = new Date(shiftEndTime.getTime() - (30 * 60 * 1000));
    
    if (isClockedIn && !isOnBreak && now >= endReminder && now < shiftEndTime) {
      newNotifications.push({
        id: 'shift-ending',
        type: 'info',
        title: 'Shift Ending Soon',
        message: `Your shift ends at ${shift.shiftEndTime}. Please wrap up your tasks.`,
        icon: Clock,
        dismissible: true
      });
    }

    // Overtime warning
    if (isClockedIn && now > shiftEndTime) {
      const overtimeMinutes = Math.floor((now - shiftEndTime) / (1000 * 60));
      newNotifications.push({
        id: 'overtime',
        type: 'warning',
        title: 'In Overtime',
        message: `You've been working ${Math.floor(overtimeMinutes / 60)}h ${overtimeMinutes % 60}m past your shift. Consider clocking out.`,
        icon: Timer,
        dismissible: true
      });
    }

    // Long break warning
    if (isOnBreak && todayRecord.breakSessions) {
      const activeBreak = todayRecord.breakSessions.find(s => s.breakIn && !s.breakOut);
      if (activeBreak) {
        const breakDuration = Math.floor((now - new Date(activeBreak.breakIn)) / (1000 * 60));
        if (breakDuration > 60) { // More than 1 hour
          newNotifications.push({
            id: 'long-break',
            type: 'warning',
            title: 'Extended Break',
            message: `You've been on break for ${Math.floor(breakDuration / 60)}h ${breakDuration % 60}m. Consider returning to work.`,
            icon: Coffee,
            dismissible: true
          });
        }
      }
    }

    setNotifications(newNotifications);
  }, [todayRecord, currentTime, getAttendanceStatus]);

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getNotificationTextColor = (type) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-800';
      case 'error':
        return 'text-red-800';
      case 'success':
        return 'text-green-800';
      default:
        return 'text-blue-800';
    }
  };

  const getShiftProgress = () => {
    if (!todayRecord?.shift || !todayRecord?.clockIn) return null;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const shiftStart = new Date(`${today} ${todayRecord.shift.shiftStartTime}`);
    const shiftEnd = new Date(`${today} ${todayRecord.shift.shiftEndTime}`);
    const clockIn = new Date(todayRecord.clockIn);

    // Use actual clock-in time if later than shift start
    const effectiveStart = clockIn > shiftStart ? clockIn : shiftStart;
    const totalShiftDuration = shiftEnd - effectiveStart;
    const elapsed = now - effectiveStart;
    
    const progress = Math.min(Math.max((elapsed / totalShiftDuration) * 100, 0), 100);
    
    return {
      progress: Math.round(progress),
      elapsed: Math.floor(elapsed / (1000 * 60)),
      total: Math.floor(totalShiftDuration / (1000 * 60)),
      isOvertime: now > shiftEnd
    };
  };

  const shiftProgress = getShiftProgress();

  if (!todayRecord?.shift) {
    return null; // Don't show widget if no shift assigned
  }

  return (
    <div className="space-y-4">
      {/* Notifications */}
      {notifications.map((notification) => {
        const Icon = notification.icon;
        return (
     <Card
  key={notification.id}
  className={`
    rounded-full 
    px-4 
    py-3 
    shadow-sm 
    flex items-center
    ${getNotificationStyle(notification.type)}
  `}
>

      <CardContent className="p-0 flex items-center justify-between w-full">


              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${getNotificationTextColor(notification.type)}`} />
                  <div>
                    <h4 className={`font-semibold ${getNotificationTextColor(notification.type)}`}>
                      {notification.title}
                    </h4>
                    <p className={`text-sm ${getNotificationTextColor(notification.type)}`}>
                      {notification.message}
                    </p>
                  </div>
                </div>
                {notification.dismissible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissNotification(notification.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Shift Progress - Only show if not clocked out */}
     {shiftProgress && !todayRecord?.clockOut && (
  <Card className="rounded-2xl shadow-md border border-gray-100">
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-semibold flex items-center gap-2">
        <Clock className="h-5 w-5 text-blue-500" />
        Today’s Shift
      </CardTitle>
    </CardHeader>

    <CardContent className="flex flex-col items-center gap-4">
      
      {/* Circular Progress */}
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="#E5E7EB"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke={shiftProgress.isOvertime ? "#9333EA" : "#2563EB"}
            strokeWidth="10"
            fill="none"
            strokeDasharray={2 * Math.PI * 56}
            strokeDashoffset={
              (1 - shiftProgress.progress / 100) * 2 * Math.PI * 56
            }
            strokeLinecap="round"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold">
            {shiftProgress.progress}%
          </span>
          <span className="text-xs text-gray-500">
            {shiftProgress.isOvertime ? 'Overtime' : 'Completed'}
          </span>
        </div>
      </div>

      {/* Time Info */}
      <div className="text-center text-sm text-gray-600 space-y-1">
        <div>
          {todayRecord.shift.shiftStartTime} – {todayRecord.shift.shiftEndTime}
        </div>
        <div className="font-medium text-gray-800">
          Worked: {Math.floor(shiftProgress.elapsed / 60)}h {shiftProgress.elapsed % 60}m
        </div>
        {/* 🏢 NEW: Work Mode Display */}
        {todayRecord.workMode && (
          <div className="flex items-center justify-center gap-1 mt-2">
            {(() => {
              const workModeDisplay = getWorkModeDisplay(todayRecord.workMode);
              const Icon = workModeDisplay.icon;
              return (
                <Badge className={`${workModeDisplay.color} border-0 text-xs`}>
                  <Icon className="h-3 w-3 mr-1" />
                  {workModeDisplay.label}
                </Badge>
              );
            })()}
          </div>
        )}
      </div>

    </CardContent>
  </Card>
)}

      {/* Shift Completed Message - Show when clocked out */}
      {todayRecord?.clockOut && (
        <Card className="rounded-2xl shadow-md border border-green-100 bg-green-50">
          <CardContent className="p-6 flex flex-col items-center gap-3">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <div className="text-center">
              <h3 className="font-semibold text-green-900 text-lg">Shift Completed!</h3>
              <p className="text-sm text-green-700 mt-1">
                You've successfully clocked out for today
              </p>
              <div className="mt-3 text-sm text-green-600">
                {todayRecord.shift.shiftStartTime} – {todayRecord.shift.shiftEndTime}
              </div>
              {/* 🏢 NEW: Work Mode Display for completed shift */}
              {todayRecord.workMode && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  {(() => {
                    const workModeDisplay = getWorkModeDisplay(todayRecord.workMode);
                    const Icon = workModeDisplay.icon;
                    return (
                      <Badge className={`${workModeDisplay.color} border-0 text-xs`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {workModeDisplay.label}
                      </Badge>
                    );
                  })()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default ShiftStatusWidget;