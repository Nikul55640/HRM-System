import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../shared/ui/dialog';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Textarea } from '../../../shared/ui/textarea';
import { Label } from '../../../shared/ui/label';
import { Checkbox } from '../../../shared/ui/checkbox';
import { Calendar } from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '../../../shared/ui/popover';
import { Calendar as ShadCalendar } from '../../../shared/ui/calendar';
import { toast } from 'react-toastify';
import calendarService from '../../../services/calendarService';

const EventModal = ({ open, event, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object({
    title: Yup.string().required('Event title is required'),
    startDate: Yup.date().required('Start date is required'),
    endDate: Yup.date().required('End date is required'),
    type: Yup.string().required('Event type is required'),
    description: Yup.string().max(500, 'Description must be less than 500 characters'),
  });

  const formik = useFormik({
    initialValues: {
      title: event?.title || '',
      startDate: event?.startDate ? new Date(event.startDate) : null,
      endDate: event?.endDate ? new Date(event.endDate) : null,
      type: event?.type || 'event',
      description: event?.description || '',
      location: event?.location || '',
      isAllDay: event?.isAllDay ?? true,
      isRecurring: event?.isRecurring ?? false,
      recurrencePattern: event?.recurrencePattern || 'none',
      color: event?.color || '#3b82f6',
      isPublic: event?.isPublic ?? true,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        const eventData = {
          ...values,
          startDate: values.startDate?.toISOString(),
          endDate: values.endDate?.toISOString(),
        };

        if (event) {
          await calendarService.updateEvent(event._id || event.id, eventData);
          toast.success('Event updated successfully');
        } else {
          await calendarService.createEvent(eventData);
          toast.success('Event created successfully');
        }

        onSuccess();
      } catch (error) {
        console.error('Error saving event:', error);
        toast.error(error.response?.data?.message || 'Failed to save event');
      } finally {
        setLoading(false);
      }
    },
  });

  // Auto-set end date when start date changes
  useEffect(() => {
    if (formik.values.startDate && !formik.values.endDate) {
      formik.setFieldValue('endDate', formik.values.startDate);
    }
  }, [formik.values.startDate]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Create Event'}</DialogTitle>
          <DialogDescription>
            {event ? 'Update event details' : 'Create a new company event'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              className={formik.errors.title ? 'border-red-500' : ''}
              placeholder="e.g., Company Annual Meeting"
            />
            {formik.errors.title && (
              <p className="text-sm text-red-500">{formik.errors.title}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className={`w-full justify-start text-left font-normal ${
                      formik.errors.startDate ? 'border-red-500' : ''
                    }`}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {formik.values.startDate
                      ? formik.values.startDate.toDateString()
                      : 'Pick start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <ShadCalendar
                    mode="single"
                    selected={formik.values.startDate}
                    onSelect={(date) => formik.setFieldValue('startDate', date)}
                  />
                </PopoverContent>
              </Popover>
              {formik.errors.startDate && (
                <p className="text-sm text-red-500">{formik.errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className={`w-full justify-start text-left font-normal ${
                      formik.errors.endDate ? 'border-red-500' : ''
                    }`}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {formik.values.endDate
                      ? formik.values.endDate.toDateString()
                      : 'Pick end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <ShadCalendar
                    mode="single"
                    selected={formik.values.endDate}
                    onSelect={(date) => formik.setFieldValue('endDate', date)}
                  />
                </PopoverContent>
              </Popover>
              {formik.errors.endDate && (
                <p className="text-sm text-red-500">{formik.errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Event Type and Color */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Event Type *</Label>
              <select
                id="type"
                name="type"
                value={formik.values.type}
                onChange={formik.handleChange}
                className={`w-full border rounded-md px-3 py-2 ${
                  formik.errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="event">Company Event</option>
                <option value="meeting">Meeting</option>
                <option value="training">Training</option>
                <option value="conference">Conference</option>
                <option value="team_building">Team Building</option>
                <option value="announcement">Announcement</option>
              </select>
              {formik.errors.type && (
                <p className="text-sm text-red-500">{formik.errors.type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Event Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={formik.values.color}
                  onChange={formik.handleChange}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <Input
                  value={formik.values.color}
                  onChange={(e) => formik.setFieldValue('color', e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formik.values.location}
              onChange={formik.handleChange}
              placeholder="e.g., Conference Room A, Online, etc."
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              value={formik.values.description}
              onChange={formik.handleChange}
              className={formik.errors.description ? 'border-red-500' : ''}
              placeholder="Event description (optional)"
            />
            {formik.errors.description && (
              <p className="text-sm text-red-500">{formik.errors.description}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAllDay"
                checked={formik.values.isAllDay}
                onCheckedChange={(value) => formik.setFieldValue('isAllDay', value)}
              />
              <Label htmlFor="isAllDay">All Day Event</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={formik.values.isPublic}
                onCheckedChange={(value) => formik.setFieldValue('isPublic', value)}
              />
              <Label htmlFor="isPublic">Visible to All Employees</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={formik.values.isRecurring}
                onCheckedChange={(value) => formik.setFieldValue('isRecurring', value)}
              />
              <Label htmlFor="isRecurring">Recurring Event</Label>
            </div>

            {formik.values.isRecurring && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="recurrencePattern">Recurrence Pattern</Label>
                <select
                  id="recurrencePattern"
                  name="recurrencePattern"
                  value={formik.values.recurrencePattern}
                  onChange={formik.handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {event ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                event ? 'Update Event' : 'Create Event'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;