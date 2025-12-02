import mongoose from 'mongoose';

const { Schema } = mongoose;

// Department Schema
const departmentSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      maxlength: [100, 'Department name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Department code cannot exceed 20 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    parentDepartment: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Pre-save hook to generate department code if not provided
departmentSchema.pre('save', async function (next) {
  if (!this.code) {
    // Generate department code from name (first 3-4 letters, uppercase)
    const nameWords = this.name.trim().split(/\s+/);
    let code = '';

    if (nameWords.length === 1) {
      // Single word: take first 4 letters
      code = nameWords[0].substring(0, 4).toUpperCase();
    } else {
      // Multiple words: take first letter of each word (up to 4 words)
      code = nameWords
        .slice(0, 4)
        .map((word) => word[0])
        .join('')
        .toUpperCase();
    }

    // Check if code already exists
    let suffix = 1;
    let uniqueCode = code;

    while (await this.constructor.findOne({ code: uniqueCode, _id: { $ne: this._id } })) {
      uniqueCode = `${code}${suffix}`;
      suffix++;
    }

    this.code = uniqueCode;
  }
  next();
});

// Pre-save hook to validate hierarchical structure
departmentSchema.pre('save', async function (next) {
  // Prevent department from being its own parent
  if (this.parentDepartment && this.parentDepartment.toString() === this._id.toString()) {
    return next(new Error('Department cannot be its own parent'));
  }

  // Prevent circular references in hierarchy
  if (this.parentDepartment) {
    const visited = new Set([this._id.toString()]);
    let currentParentId = this.parentDepartment;

    while (currentParentId) {
      const parentIdStr = currentParentId.toString();

      if (visited.has(parentIdStr)) {
        return next(new Error('Circular reference detected in department hierarchy'));
      }

      visited.add(parentIdStr);

      const parent = await this.constructor.findById(currentParentId).select('parentDepartment');
      if (!parent) {
        return next(new Error('Parent department does not exist'));
      }

      currentParentId = parent.parentDepartment;
    }
  }

  next();
});

// Virtual for child departments
departmentSchema.virtual('children', {
  ref: 'Department',
  localField: '_id',
  foreignField: 'parentDepartment',
});

// Virtual for employees in this department
departmentSchema.virtual('employees', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'jobInfo.department',
});

// Indexes
departmentSchema.index({ name: 1 });
departmentSchema.index({ code: 1 }, { unique: true, sparse: true });
departmentSchema.index({ parentDepartment: 1 });
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ manager: 1 });
departmentSchema.index({ createdAt: -1 });

// Compound indexes for common queries
departmentSchema.index({ isActive: 1, name: 1 });
departmentSchema.index({ parentDepartment: 1, isActive: 1 });

// Instance method to check if department is active
departmentSchema.methods.isActiveDepartment = function () {
  return this.isActive === true;
};

// Instance method to get full department path (for hierarchical display)
departmentSchema.methods.getFullPath = async function () {
  const path = [this.name];
  let currentDept = this;

  while (currentDept.parentDepartment) {
    currentDept = await this.constructor.findById(currentDept.parentDepartment);
    if (!currentDept) break;
    path.unshift(currentDept.name);
  }

  return path.join(' > ');
};

// Instance method to get all ancestor departments
departmentSchema.methods.getAncestors = async function () {
  const ancestors = [];
  let currentParentId = this.parentDepartment;

  while (currentParentId) {
    const parent = await this.constructor.findById(currentParentId);
    if (!parent) break;
    ancestors.push(parent);
    currentParentId = parent.parentDepartment;
  }

  return ancestors;
};

// Instance method to get all descendant departments (recursive)
departmentSchema.methods.getDescendants = async function () {
  const descendants = [];

  const findChildren = async (parentId) => {
    const children = await this.constructor.find({ parentDepartment: parentId });

    for (const child of children) {
      descendants.push(child);
      await findChildren(child._id);
    }
  };

  await findChildren(this._id);
  return descendants;
};

// Instance method to check if department has children
departmentSchema.methods.hasChildren = async function () {
  const count = await this.constructor.countDocuments({ parentDepartment: this._id });
  return count > 0;
};

// Static method to find active departments
departmentSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

// Static method to find root departments (no parent)
departmentSchema.statics.findRootDepartments = function () {
  return this.find({ parentDepartment: null, isActive: true });
};

// Static method to find by parent department
departmentSchema.statics.findByParent = function (parentId) {
  return this.find({ parentDepartment: parentId, isActive: true });
};

// Static method to search departments by name or code
departmentSchema.statics.searchDepartments = function (searchTerm) {
  const regex = new RegExp(searchTerm, 'i');
  return this.find({
    $or: [
      { name: regex },
      { code: regex },
    ],
    isActive: true,
  });
};

// Static method to get department hierarchy tree
departmentSchema.statics.getHierarchyTree = async function (parentId = null) {
  const departments = await this.find({ parentDepartment: parentId, isActive: true })
    .populate('manager', 'personalInfo.firstName personalInfo.lastName employeeId')
    .sort({ name: 1 });

  const tree = [];

  for (const dept of departments) {
    const node = {
      ...dept.toObject(),
      children: await this.getHierarchyTree(dept._id),
    };
    tree.push(node);
  }

  return tree;
};

// Static method to validate department code uniqueness
departmentSchema.statics.isCodeUnique = async function (code, excludeId = null) {
  const query = { code: code.toUpperCase() };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const existing = await this.findOne(query);
  return !existing;
};

const Department = mongoose.model('Department', departmentSchema);

export default Department;
