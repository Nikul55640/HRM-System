import mongoose from "mongoose";

const companyEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    /* -------------------------------------------------------
       EVENT TYPE
    ------------------------------------------------------- */
    type: {
      type: String,
      required: true,
      enum: [
        "holiday",
        "optional_holiday",
        "regional_holiday",
        "company_event",
        "meeting",
        "training",
        "birthday",
        "work_anniversary",
        "other",
      ],
      index: true,
    },

    /* -------------------------------------------------------
       DATE RANGE
    ------------------------------------------------------- */
    date: { type: Date, required: true, index: true },
    endDate: { type: Date },

    isAllDay: { type: Boolean, default: true },

    /* -------------------------------------------------------
       RECURRENCE
    ------------------------------------------------------- */
    isRecurring: { type: Boolean, default: false },

    recurrencePattern: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
    },

    recurrenceEndDate: { type: Date },

    repeatEvery: { type: Number, default: 1 }, // every X days/weeks/months
    recurrenceExceptions: [{ type: Date }], // skip specific dates

    /* -------------------------------------------------------
       EMPLOYEE-RELATED EVENTS
    ------------------------------------------------------- */
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    /* -------------------------------------------------------
       COMPANY-WIDE EVENT FIELDS
    ------------------------------------------------------- */
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
    ],

    isPublic: { type: Boolean, default: true },
    location: { type: String, trim: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],

    color: {
      type: String,
      default: null, // auto-resolve by type
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

/* -------------------------------------------------------
   AUTO COLOR ASSIGNMENT BY EVENT TYPE
------------------------------------------------------- */
const colorMap = {
  holiday: "#ef4444", // red
  optional_holiday: "#f97316", // orange
  regional_holiday: "#fb923c",
  birthday: "#ec4899", // pink
  work_anniversary: "#8b5cf6", // purple
  meeting: "#3b82f6", // blue
  training: "#0ea5e9", // sky
  company_event: "#10b981", // green
  other: "#6b7280", // gray
};

companyEventSchema.pre("save", function (next) {
  if (!this.color) {
    this.color = colorMap[this.type] ?? "#6b7280";
  }
  next();
});

/* -------------------------------------------------------
   INDEXES
------------------------------------------------------- */
companyEventSchema.index({ date: 1, type: 1 });
companyEventSchema.index({ employeeId: 1, type: 1 });
companyEventSchema.index({ createdBy: 1 });
companyEventSchema.index({ isRecurring: 1 });

/* -------------------------------------------------------
   📌 EXPAND RECURRING EVENTS
------------------------------------------------------- */
companyEventSchema.statics.expandRecurringEvents = function (
  event,
  startRange,
  endRange
) {
  const results = [];

  if (!event.isRecurring) {
    results.push(event);
    return results;
  }

  let current = new Date(event.date);

  const recurrenceEnd =
    event.recurrenceEndDate || new Date(endRange.getTime() + 86400000);

  while (current <= recurrenceEnd && current <= endRange) {
    if (current >= startRange) {
      const dateStr = current.toISOString().split("T")[0];
      const isException = event.recurrenceExceptions.some(
        (d) => d.toISOString().split("T")[0] === dateStr
      );

      if (!isException) {
        results.push({
          ...event.toObject(),
          date: new Date(current),
        });
      }
    }

    switch (event.recurrencePattern) {
      case "daily":
        current.setDate(current.getDate() + event.repeatEvery);
        break;
      case "weekly":
        current.setDate(current.getDate() + 7 * event.repeatEvery);
        break;
      case "monthly":
        current.setMonth(current.getMonth() + event.repeatEvery);
        break;
      case "yearly":
        current.setFullYear(current.getFullYear() + event.repeatEvery);
        break;
    }
  }

  return results;
};

/* -------------------------------------------------------
   GET EVENTS IN RANGE (INCLUDES RECURRING EVENTS)
------------------------------------------------------- */
companyEventSchema.statics.getEventsInRange = async function (
  startDate,
  endDate,
  filters = {}
) {
  const baseEvents = await this.find({
    ...filters,
    $or: [
      { isRecurring: false, date: { $gte: startDate, $lte: endDate } },
      { isRecurring: true },
    ],
  })
    .populate("employeeId", "employeeId personalInfo.firstName personalInfo.lastName")
    .populate("departments", "name")
    .populate("organizer", "firstName lastName email")
    .sort({ date: 1 });

  const expanded = [];

  for (const event of baseEvents) {
    if (event.isRecurring) {
      expanded.push(
        ...this.expandRecurringEvents(event, startDate, endDate)
      );
    } else {
      expanded.push(event);
    }
  }

  return expanded;
};

/* -------------------------------------------------------
   GET UPCOMING EVENTS
------------------------------------------------------- */
companyEventSchema.statics.getUpcomingEvents = function (
  limit = 10,
  filters = {}
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return this.find({
    date: { $gte: today },
    ...filters,
  })
    .populate("employeeId", "employeeId personalInfo.firstName personalInfo.lastName")
    .populate("departments", "name")
    .sort({ date: 1 })
    .limit(limit);
};

/* -------------------------------------------------------
   VIRTUALS
------------------------------------------------------- */
companyEventSchema.virtual("duration").get(function () {
  if (!this.endDate) return 1;
  const diff = this.endDate - this.date;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */
companyEventSchema.methods.isToday = function () {
  const today = new Date();
  return (
    new Date(this.date).toDateString() === today.toDateString()
  );
};

companyEventSchema.methods.isUpcoming = function () {
  const today = new Date();
  const weekFromNow = new Date(today.getTime() + 7 * 86400000);
  return this.date >= today && this.date <= weekFromNow;
};

export default mongoose.model("CompanyEvent", companyEventSchema);
