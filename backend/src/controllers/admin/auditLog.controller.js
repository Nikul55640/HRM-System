import auditService from "../../services/audit/audit.service.js"; 

const auditLogController = {
  getAuditLogs: async (req, res) => {
    try {
      const result = await auditService.getAuditLogs(req.query);

      res.status(200).json({
        success: true,
        data: result.logs,
        pagination: {
          page: Number(req.query.page || 1),
          limit: Number(req.query.limit || 50),
          total: result.total,
        },
        summary: result.summary,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching audit logs",
        error: error.message,
      });
    }
  },

  getAuditLogById: async (req, res) => {
    try {
      const log = await auditService.getAuditLogById(req.params.id);
      if (!log) {
        return res.status(404).json({ success: false, message: "Not found" });
      }
      res.status(200).json({ success: true, data: log });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  cleanupAuditLogs: async (req, res) => {
    try {
      const deleted = await auditService.cleanupAuditLogs(
        Number(req.body.olderThanDays || 90)
      );

      res.status(200).json({
        success: true,
        message: `Deleted ${deleted} audit logs`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

export default auditLogController;
