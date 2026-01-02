import { EmergencyContact, Employee } from '../../models/index.js';
import logger from '../../utils/logger.js';

// Get all emergency contacts for the authenticated employee
export const getEmergencyContacts = async (req, res) => {
  try {
    // Find employee by userId
    const employee = await Employee.findOne({
      where: { userId: req.user.id },
      attributes: ['id']
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    const contacts = await EmergencyContact.getByEmployeeId(employee.id);

    res.json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    logger.error('Error fetching emergency contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency contacts',
      error: error.message,
    });
  }
};

// Get a specific emergency contact
export const getEmergencyContact = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find employee by userId
    const employee = await Employee.findOne({
      where: { userId: req.user.id },
      attributes: ['id']
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    const contact = await EmergencyContact.findOne({
      where: {
        id,
        employeeId: employee.id, // Ensure employee can only access their own contacts
      },
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found',
      });
    }

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    logger.error('Error fetching emergency contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency contact',
      error: error.message,
    });
  }
};

// Create a new emergency contact
export const createEmergencyContact = async (req, res) => {
  try {
    const { name, relationship, phone, alternatePhone, address, isPrimary } = req.body;
    
    // Find employee by userId
    const employee = await Employee.findOne({
      where: { userId: req.user.id },
      attributes: ['id']
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    // Validate required fields
    if (!name || !relationship || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, relationship, and phone number are required',
      });
    }

    // Check if this is the first contact for the employee
    const existingContacts = await EmergencyContact.findAll({
      where: { employeeId: employee.id },
    });

    // If this is the first contact, make it primary automatically
    const shouldBePrimary = isPrimary || existingContacts.length === 0;

    const contactData = {
      employeeId: employee.id,
      name: name.trim(),
      relationship,
      phone: phone.trim(),
      alternatePhone: alternatePhone?.trim() || null,
      address: address?.trim() || null,
      isPrimary: shouldBePrimary,
      createdBy: req.user.id,
    };

    const contact = await EmergencyContact.create(contactData);

    res.status(201).json({
      success: true,
      message: 'Emergency contact created successfully',
      data: contact,
    });
  } catch (error) {
    logger.error('Error creating emergency contact:', error);
    
    // Handle unique constraint violation for primary contact
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'You already have a primary emergency contact. Please unset the current primary contact first.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create emergency contact',
      error: error.message,
    });
  }
};

// Update an emergency contact
export const updateEmergencyContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, relationship, phone, alternatePhone, address, isPrimary } = req.body;
    
    // Find employee by userId
    const employee = await Employee.findOne({
      where: { userId: req.user.id },
      attributes: ['id']
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    const contact = await EmergencyContact.findOne({
      where: {
        id,
        employeeId: employee.id, // Ensure employee can only update their own contacts
      },
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found',
      });
    }

    // Prepare update data
    const updateData = {
      updatedBy: req.user.id,
    };

    if (name !== undefined) updateData.name = name.trim();
    if (relationship !== undefined) updateData.relationship = relationship;
    if (phone !== undefined) updateData.phone = phone.trim();
    if (alternatePhone !== undefined) updateData.alternatePhone = alternatePhone?.trim() || null;
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (isPrimary !== undefined) updateData.isPrimary = isPrimary;

    await contact.update(updateData);

    // Fetch updated contact
    const updatedContact = await EmergencyContact.findByPk(id);

    res.json({
      success: true,
      message: 'Emergency contact updated successfully',
      data: updatedContact,
    });
  } catch (error) {
    logger.error('Error updating emergency contact:', error);
    
    // Handle unique constraint violation for primary contact
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'You already have a primary emergency contact. Please unset the current primary contact first.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update emergency contact',
      error: error.message,
    });
  }
};

// Delete an emergency contact
export const deleteEmergencyContact = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find employee by userId
    const employee = await Employee.findOne({
      where: { userId: req.user.id },
      attributes: ['id']
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    const contact = await EmergencyContact.findOne({
      where: {
        id,
        employeeId: employee.id, // Ensure employee can only delete their own contacts
      },
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found',
      });
    }

    await contact.destroy();

    res.json({
      success: true,
      message: 'Emergency contact deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting emergency contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete emergency contact',
      error: error.message,
    });
  }
};

// Set primary emergency contact
export const setPrimaryEmergencyContact = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find employee by userId
    const employee = await Employee.findOne({
      where: { userId: req.user.id },
      attributes: ['id']
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    // Verify the contact belongs to the employee
    const contact = await EmergencyContact.findOne({
      where: {
        id,
        employeeId: employee.id,
      },
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found',
      });
    }

    // Set as primary using the static method
    const updatedContact = await EmergencyContact.setPrimary(id, employee.id);

    res.json({
      success: true,
      message: 'Primary emergency contact updated successfully',
      data: updatedContact,
    });
  } catch (error) {
    logger.error('Error setting primary emergency contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set primary emergency contact',
      error: error.message,
    });
  }
};