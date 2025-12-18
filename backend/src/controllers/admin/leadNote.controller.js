import { LeadNote, Lead, Employee } from '../../models/index.js';
import auditService from '../../services/audit/audit.service.js';

class LeadNoteController {
  // Get notes for a lead
  async getNotes(req, res) {
    try {
      const { leadId } = req.params;
      const { page = 1, limit = 20, type } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { leadId };
      if (type) whereClause.type = type;

      const notes = await LeadNote.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Employee,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: notes.rows,
        pagination: {
          total: notes.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(notes.count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notes'
      });
    }
  }

  // Create new note
  async createNote(req, res) {
    try {
      const { leadId } = req.params;
      const noteData = {
        ...req.body,
        leadId: parseInt(leadId),
        createdBy: req.user.id
      };

      // Verify lead exists
      const lead = await Lead.findByPk(leadId);
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }

      const note = await LeadNote.create(noteData);

      // Audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'LEAD_NOTE_CREATED',
        resource: 'LeadNote',
        resourceId: note.id,
        details: {
          leadId: lead.leadId,
          noteType: note.type,
          isPrivate: note.isPrivate
        }
      });

      const createdNote = await LeadNote.findByPk(note.id, {
        include: [
          {
            model: Employee,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Note created successfully',
        data: createdNote
      });
    } catch (error) {
      console.error('Error creating note:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create note'
      });
    }
  }

  // Update note
  async updateNote(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const note = await LeadNote.findByPk(id);

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      // Check if user can edit this note (creator or admin)
      if (note.createdBy !== req.user.id && !['admin', 'hr'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit your own notes'
        });
      }

      await note.update(updateData);

      // Audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'LEAD_NOTE_UPDATED',
        resource: 'LeadNote',
        resourceId: note.id,
        details: {
          changes: updateData
        }
      });

      const updatedNote = await LeadNote.findByPk(id, {
        include: [
          {
            model: Employee,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Note updated successfully',
        data: updatedNote
      });
    } catch (error) {
      console.error('Error updating note:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update note'
      });
    }
  }

  // Delete note
  async deleteNote(req, res) {
    try {
      const { id } = req.params;

      const note = await LeadNote.findByPk(id);

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      // Check if user can delete this note (creator or admin)
      if (note.createdBy !== req.user.id && !['admin', 'hr'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own notes'
        });
      }

      await note.destroy();

      // Audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'LEAD_NOTE_DELETED',
        resource: 'LeadNote',
        resourceId: id,
        details: {
          content: note.content.substring(0, 100),
          type: note.type
        }
      });

      res.json({
        success: true,
        message: 'Note deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete note'
      });
    }
  }
}

export default new LeadNoteController();