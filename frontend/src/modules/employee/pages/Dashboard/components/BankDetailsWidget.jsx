import { Card, CardContent, CardHeader, CardTitle } from "../../../../../shared/ui/card";
import { CreditCard } from "lucide-react";
import PropTypes from "prop-types";

/**
 * Bank Details Widget Component
 * Displays bank details management in a clean card format
 */
const BankDetailsWidget = ({ onClick }) => {
  return (
    <Card 
      className="bg-white shadow-sm rounded-xl border-0 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
      onClick={onClick}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <h3 className="font-semibold text-gray-900 text-xs sm:text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-green-600" />
            <span className="text-sm sm:text-base">Bank Details</span>
          </h3>
        </div>
        <div className="text-xs sm:text-sm text-gray-600 space-y-2">
          <div className="font-medium text-xs sm:text-sm">Manage Details</div>
          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs sm:text-sm font-medium hover:bg-blue-200 transition-colors">
            View
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

BankDetailsWidget.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default BankDetailsWidget;