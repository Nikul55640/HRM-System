import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface, Sequelize) => {
    // Create leads table
    await queryInterface.createTable('leads', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      leadId: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false
      },
      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      company: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      position: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      source: {
        type: DataTypes.ENUM('website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'trade_show', 'other'),
        allowNull: false,
        defaultValue: 'website'
      },
      status: {
        type: DataTypes.ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'),
        allowNull: false,
        defaultValue: 'new'
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      },
      estimatedValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      expectedCloseDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'employees',
          key: 'id'
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      customFields: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
      },
      lastContactDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      nextFollowUpDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id'
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create lead_activities table
    await queryInterface.createTable('lead_activities', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      leadId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'leads',
          key: 'id'
        }
      },
      type: {
        type: DataTypes.ENUM('call', 'email', 'meeting', 'task', 'note', 'status_change', 'assignment_change'),
        allowNull: false
      },
      subject: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      },
      scheduledDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      completedDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      outcome: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      nextAction: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'employees',
          key: 'id'
        }
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id'
        }
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create lead_notes table
    await queryInterface.createTable('lead_notes', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      leadId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'leads',
          key: 'id'
        }
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('general', 'call_log', 'meeting_notes', 'follow_up', 'important'),
        allowNull: false,
        defaultValue: 'general'
      },
      isPrivate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id'
        }
      },
      attachments: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('leads', ['leadId']);
    await queryInterface.addIndex('leads', ['email']);
    await queryInterface.addIndex('leads', ['status']);
    await queryInterface.addIndex('leads', ['assignedTo']);
    await queryInterface.addIndex('leads', ['createdBy']);
    await queryInterface.addIndex('leads', ['expectedCloseDate']);

    await queryInterface.addIndex('lead_activities', ['leadId']);
    await queryInterface.addIndex('lead_activities', ['type']);
    await queryInterface.addIndex('lead_activities', ['status']);
    await queryInterface.addIndex('lead_activities', ['scheduledDate']);
    await queryInterface.addIndex('lead_activities', ['assignedTo']);
    await queryInterface.addIndex('lead_activities', ['createdBy']);

    await queryInterface.addIndex('lead_notes', ['leadId']);
    await queryInterface.addIndex('lead_notes', ['type']);
    await queryInterface.addIndex('lead_notes', ['createdBy']);
    await queryInterface.addIndex('lead_notes', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('lead_notes');
    await queryInterface.dropTable('lead_activities');
    await queryInterface.dropTable('leads');
  }
};