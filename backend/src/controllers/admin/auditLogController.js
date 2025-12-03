import AuditLog from '../../models/AuditLog.js';

// ---------------------------------------------------------
// GET AUDIT LOGS (Admin)
// ---------------------------------------------------------
const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      severity,
      entityType,
      action,
      userId,
      startDate,
      endDate,
      search
    } = req.query;
    
    console.log('📋 [AUDIT] Fetching audit logs:', { page, limit, severity, entityType, action });
    
    // Build filter
    const filter = {};
    
    if (severity) filter.severity = severity;
    if (entityType) filter.entityType = entityType;
    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    
    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { entityDisplayName: { $regex: search, $options: 'i' } },
        { performedByName: { $regex: search, $options: 'i' } },
        { performedByEmail: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get logs with pagination
    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await AuditLog.countDocuments(filter);
    
    // Get summary statistics
    const stats = await AuditLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalLogs: { $sum: 1 },
          severityBreakdown: {
            $push: '$severity'
          },
          actionBreakdown: {
            $push: '$action'
          },
          entityTypeBreakdown: {
            $push: '$entityType'
          }
        }
      }
    ]);
    
    // Process statistics
    let summary = {
      totalLogs: 0,
      severityBreakdown: {},
      actionBreakdown: {},
      entityTypeBreakdown: {}
    };
    
    if (stats.length > 0) {
      const stat = stats[0];
      summary.totalLogs = stat.totalLogs;
      
      // Count occurrences
      summary.severityBreakdown = stat.severityBreakdown.reduce((acc, severity) => {
        acc[severity] = (acc[severity] || 0) + 1;
        return acc;
      }, {});
      
      summary.actionBreakdown = stat.actionBreakdown.reduce((acc, action) => {
        acc[action] = (acc[action] || 0) + 1;
        return acc;
      }, {});
      
      summary.entityTypeBreakdown = stat.entityTypeBreakdown.reduce((acc, entityType) => {
        acc[entityType] = (acc[entityType] || 0) + 1;
        return acc;
      }, {});
    }
    
    console.log('✅ [AUDIT] Audit logs fetched:', logs.length, 'logs');
    
    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      summary
    });
    
  } catch (error) {
    console.error('❌ [AUDIT] Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs',
      error: error.message
    });
  }
};

// ---------------------------------------------------------
// GET AUDIT LOG BY ID
// ---------------------------------------------------------
const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('📄 [AUDIT] Fetching audit log:', id);
    
    const log = await AuditLog.findById(id).lean();
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }
    
    console.log('✅ [AUDIT] Audit log fetched');
    
    res.status(200).json({
      success: true,
      data: log
    });
    
  } catch (error) {
    console.error('❌ [AUDIT] Get audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit log',
      error: error.message
    });
  }
};

// ---------------------------------------------------------
// EXPORT AUDIT LOGS
// ---------------------------------------------------------
const exportAuditLogs = async (req, res) => {
  try {
    const {
      format = 'json',
      severity,
      entityType,
      action,
      startDate,
      endDate
    } = req.query;
    
    console.log('📤 [AUDIT] Exporting audit logs:', { format, severity, entityType });
    
    // Build filter (same as getAuditLogs)
    const filter = {};
    if (severity) filter.severity = severity;
    if (entityType) filter.entityType = entityType;
    if (action) filter.action = action;
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    // Get all matching logs (no pagination for export)
    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .lean();
    
    console.log('✅ [AUDIT] Export data prepared:', logs.length, 'logs');
    
    if (format === 'csv') {
      // Convert to CSV
      const csvHeaders = [
        'Timestamp',
        'Action',
        'Severity',
        'Entity Type',
        'Entity ID',
        'Entity Name',
        'User ID',
        'User Role',
        'Performed By',
        'Email',
        'IP Address',
        'Description'
      ];
      
      const csvRows = logs.map(log => [
        log.timestamp.toISOString(),
        log.action,
        log.severity,
        log.entityType,
        log.entityId,
        log.entityDisplayName,
        log.userId,
        log.userRole,
        log.performedByName,
        log.performedByEmail,
        log.ipAddress,
        log.description || ''
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field || ''}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
      
    } else {
      // Return as JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        success: true,
        exportedAt: new Date().toISOString(),
        totalRecords: logs.length,
        filters: { severity, entityType, action, startDate, endDate },
        data: logs
      });
    }
    
    // Log the export action
    await AuditLog.logAction({
      action: 'EXPORT',
      severity: 'info',
      entityType: 'AuditLog',
      entityId: 'export',
      entityDisplayName: 'Audit Logs Export',
      userId: req.user.id || req.user._id,
      userRole: req.user.role,
      performedByName: req.user.fullName,
      performedByEmail: req.user.email,
      meta: {
        format,
        recordCount: logs.length,
        filters: { severity, entityType, action, startDate, endDate }
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
  } catch (error) {
    console.error('❌ [AUDIT] Export audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting audit logs',
      error: error.message
    });
  }
};

// ---------------------------------------------------------
// DELETE OLD AUDIT LOGS (Cleanup)
// ---------------------------------------------------------
const cleanupAuditLogs = async (req, res) => {
  try {
    const { olderThanDays = 90 } = req.body;
    
    console.log('🧹 [AUDIT] Cleaning up audit logs older than', olderThanDays, 'days');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThanDays));
    
    const result = await AuditLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });
    
    console.log('✅ [AUDIT] Cleanup completed:', result.deletedCount, 'logs deleted');
    
    // Log the cleanup action
    await AuditLog.logAction({
      action: 'DELETE',
      severity: 'info',
      entityType: 'AuditLog',
      entityId: 'cleanup',
      entityDisplayName: 'Audit Logs Cleanup',
      userId: req.user.id || req.user._id,
      userRole: req.user.role,
      performedByName: req.user.fullName,
      performedByEmail: req.user.email,
      meta: {
        olderThanDays: parseInt(olderThanDays),
        cutoffDate: cutoffDate.toISOString(),
        deletedCount: result.deletedCount
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} audit logs older than ${olderThanDays} days`,
      data: {
        deletedCount: result.deletedCount,
        cutoffDate: cutoffDate.toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [AUDIT] Cleanup audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up audit logs',
      error: error.message
    });
  }
};

export {
  getAuditLogs,
  getAuditLogById,
  exportAuditLogs,
  cleanupAuditLogs
};
