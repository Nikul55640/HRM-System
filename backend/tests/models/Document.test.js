const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Document = require('../../src/models/Document');
const Employee = require('../../src/models/Employee');
const User = require('../../src/models/User');

let mongoServer;

describe('Document Model', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  }, 30000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  }, 30000);

  afterEach(async () => {
    await Document.deleteMany({});
    await Employee.deleteMany({});
    await User.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid document with required fields', async () => {
      const employeeId = new mongoose.Types.ObjectId();
      const uploaderId = new mongoose.Types.ObjectId();

      const validDocument = {
        employeeId,
        fileName: 'resume_2024.pdf',
        originalName: 'John_Doe_Resume.pdf',
        fileType: 'PDF',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        documentType: 'Resume',
        storagePath: '/uploads/documents/resume_2024.pdf',
        uploadedBy: uploaderId,
      };

      const document = new Document(validDocument);
      const savedDocument = await document.save();

      expect(savedDocument._id).toBeDefined();
      expect(savedDocument.employeeId.toString()).toBe(employeeId.toString());
      expect(savedDocument.fileName).toBe('resume_2024.pdf');
      expect(savedDocument.fileType).toBe('PDF');
      expect(savedDocument.documentType).toBe('Resume');
      expect(savedDocument.isPublic).toBe(false);
      expect(savedDocument.uploadedAt).toBeDefined();
    });

    it('should fail validation when required fields are missing', async () => {
      const invalidDocument = new Document({
        fileName: 'test.pdf',
      });

      await expect(invalidDocument.save()).rejects.toThrow();
    });

    it('should normalize file type to uppercase', async () => {
      const employeeId = new mongoose.Types.ObjectId();
      const uploaderId = new mongoose.Types.ObjectId();

      const document = new Document({
        employeeId,
        fileName: 'document.pdf',
        originalName: 'document.pdf',
        fileType: 'pdf',
        fileSize: 1024,
        documentType: 'Contract',
        storagePath: '/uploads/document.pdf',
        uploadedBy: uploaderId,
      });

      const savedDocument = await document.save();
      expect(savedDocument.fileType).toBe('PDF');
    });

    it('should validate document type enum', async () => {
      const employeeId = new mongoose.Types.ObjectId();
      const uploaderId = new mongoose.Types.ObjectId();

      const invalidDocument = new Document({
        employeeId,
        fileName: 'test.pdf',
        originalName: 'test.pdf',
        fileType: 'PDF',
        fileSize: 1024,
        documentType: 'InvalidType',
        storagePath: '/uploads/test.pdf',
        uploadedBy: uploaderId,
      });

      await expect(invalidDocument.save()).rejects.toThrow();
    });

    it('should reject file size exceeding 10MB', async () => {
      const employeeId = new mongoose.Types.ObjectId();
      const uploaderId = new mongoose.Types.ObjectId();

      const largeDocument = new Document({
        employeeId,
        fileName: 'large.pdf',
        originalName: 'large.pdf',
        fileType: 'PDF',
        fileSize: 11000000,
        documentType: 'Resume',
        storagePath: '/uploads/large.pdf',
        uploadedBy: uploaderId,
      });

      await expect(largeDocument.save()).rejects.toThrow();
    });

    it('should reject invalid file types', async () => {
      const employeeId = new mongoose.Types.ObjectId();
      const uploaderId = new mongoose.Types.ObjectId();

      const invalidDocument = new Document({
        employeeId,
        fileName: 'test.exe',
        originalName: 'test.exe',
        fileType: 'EXE',
        fileSize: 1024,
        documentType: 'Other',
        storagePath: '/uploads/test.exe',
        uploadedBy: uploaderId,
      });

      await expect(invalidDocument.save()).rejects.toThrow();
    });
  });

  describe('Virtual Properties', () => {
    it('should return formatted file size', async () => {
      const employeeId = new mongoose.Types.ObjectId();
      const uploaderId = new mongoose.Types.ObjectId();

      const document = new Document({
        employeeId,
        fileName: 'test.pdf',
        originalName: 'test.pdf',
        fileType: 'PDF',
        fileSize: 1048576,
        documentType: 'Resume',
        storagePath: '/uploads/test.pdf',
        uploadedBy: uploaderId,
      });

      await document.save();
      expect(document.fileSizeFormatted).toBe('1 MB');
    });

    it('should return file extension', async () => {
      const employeeId = new mongoose.Types.ObjectId();
      const uploaderId = new mongoose.Types.ObjectId();

      const document = new Document({
        employeeId,
        fileName: 'test.pdf',
        originalName: 'test.pdf',
        fileType: 'PDF',
        fileSize: 1024,
        documentType: 'Resume',
        storagePath: '/uploads/test.pdf',
        uploadedBy: uploaderId,
      });

      await document.save();
      expect(document.fileExtension).toBe('pdf');
    });
  });

  describe('Instance Methods', () => {
    it('should check if user can access document', async () => {
      const employeeId = new mongoose.Types.ObjectId();
      const uploaderId = new mongoose.Types.ObjectId();
      const otherUserId = new mongoose.Types.ObjectId();

      const document = new Document({
        employeeId,
        fileName: 'test.pdf',
        originalName: 'test.pdf',
        fileType: 'PDF',
        fileSize: 1024,
        documentType: 'Resume',
        storagePath: '/uploads/test.pdf',
        uploadedBy: uploaderId,
        isPublic: false,
      });

      await document.save();

      expect(document.canAccess(uploaderId)).toBe(true);
      expect(document.canAccess(otherUserId)).toBe(false);
    });

    it('should grant and revoke access', async () => {
      const employeeId = new mongoose.Types.ObjectId();
      const uploaderId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      const document = new Document({
        employeeId,
        fileName: 'test.pdf',
        originalName: 'test.pdf',
        fileType: 'PDF',
        fileSize: 1024,
        documentType: 'Resume',
        storagePath: '/uploads/test.pdf',
        uploadedBy: uploaderId,
      });

      await document.save();

      document.grantAccess(userId);
      expect(document.canAccess(userId)).toBe(true);

      document.revokeAccess(userId);
      expect(document.canAccess(userId)).toBe(false);
    });
  });

  describe('Static Methods', () => {
    it('should find documents by employee', async () => {
      const employeeId = new mongoose.Types.ObjectId();
      const uploaderId = new mongoose.Types.ObjectId();

      await Document.create([
        {
          employeeId,
          fileName: 'doc1.pdf',
          originalName: 'doc1.pdf',
          fileType: 'PDF',
          fileSize: 1024,
          documentType: 'Resume',
          storagePath: '/uploads/doc1.pdf',
          uploadedBy: uploaderId,
        },
        {
          employeeId,
          fileName: 'doc2.pdf',
          originalName: 'doc2.pdf',
          fileType: 'PDF',
          fileSize: 2048,
          documentType: 'Contract',
          storagePath: '/uploads/doc2.pdf',
          uploadedBy: uploaderId,
        },
      ]);

      const documents = await Document.findByEmployee(employeeId);
      expect(documents).toHaveLength(2);
    });

    it('should validate file type', () => {
      expect(Document.isValidFileType('PDF')).toBe(true);
      expect(Document.isValidFileType('pdf')).toBe(true);
      expect(Document.isValidFileType('EXE')).toBe(false);
    });

    it('should validate file size', () => {
      expect(Document.isValidFileSize(1024)).toBe(true);
      expect(Document.isValidFileSize(10485760)).toBe(true);
      expect(Document.isValidFileSize(10485761)).toBe(false);
      expect(Document.isValidFileSize(0)).toBe(false);
    });
  });
});
