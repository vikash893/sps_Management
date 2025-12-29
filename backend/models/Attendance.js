import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
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
    required: true,
    default: 'all'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
attendanceSchema.index({ studentId: 1, date: 1 });
attendanceSchema.index({ class: 1, section: 1, date: 1 });
attendanceSchema.index({ class: 1, section: 1, subject: 1, date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;

