import mongoose from 'mongoose';

const markSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  class: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    required: true,
    enum: ['unit_test', 'mid_term', 'final', 'assignment', 'quiz']
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
markSchema.index({ studentId: 1, subject: 1, examType: 1 });

const Mark = mongoose.model('Mark', markSchema);

export default Mark;



