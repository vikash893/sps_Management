import mongoose from 'mongoose';

const earlyLeaveSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
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
  pickupPersonName: {
    type: String,
    required: true,
    trim: true
  },
  relation: {
    type: String,
    required: true,
    trim: true
  },
  leaveTime: {
    type: Date,
    default: Date.now
  },
  parentMobile: {
    type: String,
    required: true
  },
  smsSent: {
    type: Boolean,
    default: false
  },
  smsStatus: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const EarlyLeave = mongoose.model('EarlyLeave', earlyLeaveSchema);

export default EarlyLeave;



