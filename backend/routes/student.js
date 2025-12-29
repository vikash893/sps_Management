import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import Mark from '../models/Mark.js';
import Fee from '../models/Fee.js';
import Feedback from '../models/Feedback.js';

const router = express.Router();

// All routes require student authentication
router.use(protect);
router.use(authorize('student'));

// ========== PROFILE ==========

// @route   GET /api/student/profile
// @desc    Get student profile
// @access  Private/Student
router.get('/profile', async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id })
      .populate('userId', 'username email');

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== ATTENDANCE ==========

// @route   GET /api/student/attendance
// @desc    Get student attendance
// @access  Private/Student
router.get('/attendance', async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const { startDate, endDate } = req.query;
    const query = { studentId: student._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 });

    // Calculate statistics
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const lateDays = attendance.filter(a => a.status === 'late').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    res.json({
      attendance,
      statistics: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendancePercentage
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== MARKS ==========

// @route   GET /api/student/marks
// @desc    Get student marks
// @access  Private/Student
router.get('/marks', async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const { subject, examType } = req.query;
    const query = { studentId: student._id };

    if (subject) query.subject = subject;
    if (examType) query.examType = examType;

    const marks = await Mark.find(query)
      .sort({ createdAt: -1 });

    // Group by subject and exam type
    const marksBySubject = {};
    marks.forEach(mark => {
      if (!marksBySubject[mark.subject]) {
        marksBySubject[mark.subject] = {};
      }
      if (!marksBySubject[mark.subject][mark.examType]) {
        marksBySubject[mark.subject][mark.examType] = [];
      }
      marksBySubject[mark.subject][mark.examType].push(mark);
    });

    res.json({
      marks,
      marksBySubject
    });
  } catch (error) {
    console.error('Get marks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== FEES ==========

// @route   GET /api/student/fees
// @desc    Get student fee status
// @access  Private/Student
router.get('/fees', async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const { status } = req.query;
    const query = { studentId: student._id };

    if (status) query.status = status;

    const fees = await Fee.find(query)
      .sort({ dueDate: 1 });

    // Calculate statistics (considering partial payments)
    const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalPaid = fees.reduce((sum, fee) => sum + (fee.amountPaid || 0), 0);
    const totalRemaining = fees.reduce((sum, fee) => {
      return sum + (fee.amount - (fee.amountPaid || 0));
    }, 0);
    const paidFees = fees
      .filter(fee => fee.status === 'paid')
      .reduce((sum, fee) => sum + fee.amount, 0);
    const partialFees = fees
      .filter(fee => fee.status === 'partial')
      .reduce((sum, fee) => sum + (fee.amount - (fee.amountPaid || 0)), 0);
    const pendingFees = fees
      .filter(fee => fee.status === 'pending')
      .reduce((sum, fee) => sum + fee.amount, 0);
    const overdueFees = fees
      .filter(fee => fee.status === 'overdue')
      .reduce((sum, fee) => sum + (fee.amount - (fee.amountPaid || 0)), 0);

    res.json({
      fees,
      statistics: {
        totalFees,
        totalPaid,
        totalRemaining,
        paidFees,
        partialFees,
        pendingFees,
        overdueFees
      }
    });
  } catch (error) {
    console.error('Get fees error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== FEEDBACK ==========

// @route   POST /api/student/feedback
// @desc    Submit feedback
// @access  Private/Student
router.post('/feedback', async (req, res) => {
  try {
    const { teacherId, subject, message, rating } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Please provide feedback message' });
    }

    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const feedback = new Feedback({
      studentId: student._id,
      teacherId: teacherId || null,
      subject: subject || '',
      message: message,
      rating: rating || null,
      status: 'pending'
    });

    await feedback.save();

    res.status(201).json({ 
      message: 'Feedback submitted successfully', 
      feedback 
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/student/feedback
// @desc    Get student's feedback submissions
// @access  Private/Student
router.get('/feedback', async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const feedback = await Feedback.find({ studentId: student._id })
      .populate('teacherId', 'name subject')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

