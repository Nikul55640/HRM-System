import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'profile_update',
        'bank_details_update',
        'document_upload',
        'leave_request',
        'reimbursement_request',
        'advance_request',
        'transfer_request',
        'shift_change_request',
        'request_approved',
        'request_rejected',
        'payslip_available',
        'system_announcement',
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['Request', 'LeaveRequest', 'Payslip', 'EmployeeProfile', 'Document'],
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    actionUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient querying
notificationSchema.index({ employeeId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Virtual for age of notification
notificationSchema.virtual('age').get(function () {
  return Date.now() - this.createdAt;
});

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to mark multiple as read
notificationSchema.statics.markManyAsRead = function (notificationIds, userId) {
  return this.updateMany(
    { _id: { $in: notificationIds }, userId },
    { isRead: true, readAt: new Date() },
  );
};

// Static method to mark all as read for a user
notificationSchema.statics.markAllAsRead = function (userId) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() },
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({ userId, isRead: false });
};

// Static method to delete old read notifications (cleanup)
notificationSchema.statics.deleteOldReadNotifications = function (daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return this.deleteMany({
    isRead: true,
    readAt: { $lt: cutoffDate },
  });
};

export default mongoose.model('Notification', notificationSchema);
