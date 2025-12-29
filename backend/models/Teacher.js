import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  // ✅ Support both 'phone' and 'mobile' for backward compatibility
  phone: {
    type: String,
    required: true,
    trim: true
  },
  // ✅ Add 'mobile' as alias for phone
  mobile: {
    type: String,
    trim: true,
    set: function(value) {
      // When mobile is set, also update phone
      if (value && this.phone !== value) {
        this.phone = value;
      }
      return value;
    },
    get: function() {
      return this.phone;
    }
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  qualification: {
    type: String,
    trim: true
  },
  experience: {
    type: Number,
    default: 0
  },
  // ✅ Enhanced class assignment support
  assignedClass: {
    type: String,
    trim: true,
    default: '',
    index: true
  },
  assignedSection: {
    type: String,
    trim: true,
    default: '',
    index: true
  },
  // ✅ Support multiple class assignments for future
  assignedClasses: [{
    class: String,
    section: String,
    subject: String
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // ✅ Additional fields for teacher management
  joiningDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

// ✅ Virtual for formatted class display
teacherSchema.virtual('formattedClass').get(function() {
  if (!this.assignedClass) return 'Not assigned';
  
  const classMap = {
    'Play': 'Play',
    'Nursery': 'Nursery',
    'LKG': 'LKG',
    'UKG': 'UKG',
    '1': '1st',
    '2': '2nd',
    '3': '3rd',
    '4': '4th',
    '5': '5th',
    '6': '6th',
    '7': '7th',
    '8': '8th',
    '9': '9th',
    '10': '10th',
    '11': '11th',
    '12': '12th'
  };
  
  return classMap[this.assignedClass] || this.assignedClass;
});

// ✅ Middleware to ensure phone and mobile are synced
teacherSchema.pre('save', function(next) {
  // If mobile is set but phone is empty, copy mobile to phone
  if (this.mobile && !this.phone) {
    this.phone = this.mobile;
  }
  // If phone is set but mobile is empty, copy phone to mobile
  if (this.phone && !this.mobile) {
    this.mobile = this.phone;
  }
  next();
});

// ✅ Indexes for efficient queries
teacherSchema.index({ assignedClass: 1, assignedSection: 1 });
teacherSchema.index({ subject: 1 });
teacherSchema.index({ isActive: 1 });

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;