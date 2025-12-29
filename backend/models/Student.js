import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  class: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  fatherName: {
    type: String,
    trim: true
  },
  fatherMobile: {
    type: String,
    required: true,
    trim: true
  },
  motherName: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  photo: {
    type: String,
    default: ''
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

export default Student;



