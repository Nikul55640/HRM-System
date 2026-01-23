import { Card, CardContent, CardHeader, CardTitle } from "../../../../../shared/ui/card";
import { EmptyState } from "../../../../../shared/components";
import { Gift, CakeIcon, Calendar } from "lucide-react";
import { format } from "date-fns";
import PropTypes from "prop-types";

/**
 * Birthday Widget Component
 * Displays upcoming employee birthdays
 */
const BirthdayWidget = ({ upcomingBirthdays, onViewAll }) => {
  return (
    <Card className="bg-white rounded-xl border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-pink-600" />
            <span>Upcoming Birthdays</span>
          </div>
          {upcomingBirthdays.length > 0 && (
            <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
              {upcomingBirthdays.length} upcoming
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {upcomingBirthdays.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {upcomingBirthdays.map((b, i) => (
              <div
                key={b.id || i}
                className={`flex items-start gap-3 p-2 sm:p-3 rounded-lg transition-colors ${
                  b.isToday 
                    ? 'bg-pink-50 border border-pink-200 shadow-sm' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                  b.isToday ? 'bg-pink-200' : 'bg-pink-100'
                }`}>
                  <CakeIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${
                    b.isToday ? 'text-pink-700' : 'text-pink-600'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm leading-tight truncate ${
                        b.isToday ? 'text-pink-900' : 'text-gray-900'
                      }`}>
                        {b.employeeName || 'Unknown Employee'}
                      </p>
                      
                      <div className="flex flex-col gap-0.5 mt-1">
                        <p className="text-xs text-gray-600">
                          {b.isToday ? (
                            <span className="font-medium text-pink-700 flex items-center gap-1">
                              <Gift className="w-3 h-3" />
                              Today is their birthday!
                            </span>
                          ) : (
                            `${b.daysUntil} day${b.daysUntil !== 1 ? 's' : ''} away`
                          )}
                        </p>
                        
                        {b.nextBirthdayDate && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(b.nextBirthdayDate, 'MMM dd, yyyy')}
                          </p>
                        )}
                        
                        {b.department && (
                          <p className="text-xs text-gray-400 truncate">
                            {b.department}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 mt-1 sm:mt-0">
                      {b.isToday ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-pink-200 text-pink-800 px-2 py-1 rounded-full font-medium">
                          <CakeIcon className="w-3 h-3" />
                          Today
                        </span>
                      ) : b.daysUntil <= 7 ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                          This Week
                        </span>
                      ) : b.daysUntil <= 30 ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          This Month
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {Math.ceil(b.daysUntil / 30)} month{Math.ceil(b.daysUntil / 30) !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Gift}
            title="No upcoming birthdays"
            description="Nothing to celebrate soon"
          />
        )}
        
        {upcomingBirthdays.length > 5 && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <button 
              className="w-full text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              onClick={onViewAll}
            >
              View all birthdays in calendar →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

BirthdayWidget.propTypes = {
  upcomingBirthdays: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    employeeName: PropTypes.string,
    date: PropTypes.string,
    nextBirthdayDate: PropTypes.instanceOf(Date),
    daysUntil: PropTypes.number,
    isToday: PropTypes.bool,
    department: PropTypes.string,
  })),
  onViewAll: PropTypes.func.isRequired,
};

BirthdayWidget.defaultProps = {
  upcomingBirthdays: [],
};

export default BirthdayWidget;