import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Attendance from '../models/Attendance.js';
import Mark from '../models/Mark.js';
import Fee from '../models/Fee.js';
import Feedback from '../models/Feedback.js';
import Leave from '../models/Leave.js';
import upload from '../config/multer.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// ========== STUDENT MANAGEMENT ==========

// @route   POST /api/admin/students
// @desc    Add new student
// @access  Private/Admin
router.post('/students', upload.single('photo'), async (req, res) => {
  try {
    const { name, class: studentClass, section, dob, fatherName, fatherMobile, motherName, address } = req.body;

    if (!name || !studentClass || !section || !dob || !fatherMobile) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Format DOB as password (DDMMYYYY)
    const dobDate = new Date(dob);
    const day = String(dobDate.getDate()).padStart(2, '0');
    const month = String(dobDate.getMonth() + 1).padStart(2, '0');
    const year = dobDate.getFullYear();
    const defaultPassword = `${day}${month}${year}`;

    // Generate username (firstname_lastname_class_section)
    const username = `${name.toLowerCase().replace(/\s+/g, '_')}_${studentClass}_${section}`;

    // Check if username exists
    let finalUsername = username;
    let counter = 1;
    while (await User.findOne({ username: finalUsername })) {
      finalUsername = `${username}_${counter}`;
      counter++;
    }

    // Create user
    const user = new User({
      username: finalUsername,
      password: defaultPassword,
      role: 'student',
      phone: fatherMobile
    });

    await user.save();

    // Create student profile
    const student = new Student({
      name,
      class: studentClass,
      section,
      dob: dobDate,
      fatherName,
      fatherMobile,
      motherName,
      address,
      photo: req.file ? `/uploads/${req.file.filename}` : '',
      userId: user._id
    });

    await student.save();

    // Update user with profile reference
    user.profileId = student._id;
    user.roleRef = 'Student';
    await user.save();

    res.status(201).json({
      message: 'Student added successfully',
      student: {
        ...student.toObject(),
        username: finalUsername,
        defaultPassword
      }
    });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/students
// @desc    Get all students
// @access  Private/Admin
router.get('/students', async (req, res) => {
  try {
    const { class: studentClass, section } = req.query;
    const query = {};
    
    if (studentClass) query.class = studentClass;
    if (section) query.section = section;

    const students = await Student.find(query)
      .populate('userId', 'username isActive')
      .sort({ class: 1, section: 1, name: 1 });

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/students/:id
// @desc    Get single student
// @access  Private/Admin
router.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'username isActive');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/students/:id
// @desc    Update student
// @access  Private/Admin
router.put('/students/:id', upload.single('photo'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { name, class: studentClass, section, dob, fatherName, fatherMobile, motherName, address } = req.body;

    if (name) student.name = name;
    if (studentClass) student.class = studentClass;
    if (section) student.section = section;
    if (dob) student.dob = new Date(dob);
    if (fatherName) student.fatherName = fatherName;
    if (fatherMobile) student.fatherMobile = fatherMobile;
    if (motherName) student.motherName = motherName;
    if (address) student.address = address;

    // Handle photo update
    if (req.file) {
      // Delete old photo if exists
      if (student.photo) {
        const oldPhotoPath = path.join(process.cwd(), student.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      student.photo = `/uploads/${req.file.filename}`;
    }

    await student.save();

    res.json({ message: 'Student updated successfully', student });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/admin/students/:id
// @desc    Delete student
// @access  Private/Admin
router.delete('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete photo if exists
    if (student.photo) {
      const photoPath = path.join(process.cwd(), student.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // Delete user account
    await User.findByIdAndDelete(student.userId);

    // Delete student
    await Student.findByIdAndDelete(req.params.id);

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== TEACHER MANAGEMENT ==========

// @route   POST /api/admin/teachers
// @desc    Add new teacher
// @access  Private/Admin
router.post('/teachers', async (req, res) => {
  try {
    const { 
      name, email, phone, subject, qualification, experience, 
      username, password, 
      assignedClass, assignedSection
    } = req.body;

    console.log('Teacher create data received:', req.body);

    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Please provide name, username, and password' });
    }

    // Check if username exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create user
    const user = new User({
      username,
      password,
      role: 'teacher',
      email,
      phone
    });

    await user.save();

    // Create teacher profile
    const teacher = new Teacher({
      name,
      email,
      phone: phone || req.body.mobile,
      subject,
      qualification,
      experience: experience || 0,
      userId: user._id,
      assignedClass: assignedClass || '',
      assignedSection: assignedSection || ''
    });

    await teacher.save();

    // Update user with profile reference
    user.profileId = teacher._id;
    user.roleRef = 'Teacher';
    await user.save();

    res.status(201).json({
      message: 'Teacher added successfully',
      teacher: {
        ...teacher.toObject(),
        username,
        assignedClass: teacher.assignedClass,
        assignedSection: teacher.assignedSection
      }
    });
  } catch (error) {
    console.error('Add teacher error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/teachers
// @desc    Get all teachers
// @access  Private/Admin
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate('userId', 'username isActive')
      .sort({ name: 1 });

    const formattedTeachers = teachers.map(teacher => ({
      ...teacher.toObject(),
      assignedClass: teacher.assignedClass || null,
      assignedSection: teacher.assignedSection || null
    }));

    res.json(formattedTeachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/teachers/:id
// @desc    Get single teacher
// @access  Private/Admin
router.get('/teachers/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('userId', 'username isActive');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json(teacher);
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/teachers/:id
// @desc    Update teacher
// @access  Private/Admin
router.put('/teachers/:id', async (req, res) => {
  try {
    console.log('Teacher update data received:', req.body);

    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const { 
      name, email, phone, subject, qualification, experience,
      assignedClass, assignedSection
    } = req.body;

    // Update basic info
    if (name !== undefined) teacher.name = name;
    if (email !== undefined) teacher.email = email;
    if (phone !== undefined) teacher.phone = phone;
    if (subject !== undefined) teacher.subject = subject;
    if (qualification !== undefined) teacher.qualification = qualification;
    if (experience !== undefined) teacher.experience = experience;
    
    // Update class assignment
    if (assignedClass !== undefined) teacher.assignedClass = assignedClass;
    if (assignedSection !== undefined) teacher.assignedSection = assignedSection;

    await teacher.save();

    // Update user if email/phone changed
    if (email !== undefined || phone !== undefined) {
      const user = await User.findById(teacher.userId);
      if (user) {
        if (email !== undefined) user.email = email;
        if (phone !== undefined) user.phone = phone;
        await user.save();
      }
    }

    res.json({ 
      message: 'Teacher updated successfully', 
      teacher: {
        ...teacher.toObject(),
        assignedClass: teacher.assignedClass || null,
        assignedSection: teacher.assignedSection || null
      }
    });
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/admin/teachers/:id/assign-class
// @desc    Assign/update class for teacher
// @access  Private/Admin
router.patch('/teachers/:id/assign-class', async (req, res) => {
  try {
    const { assignedClass, assignedSection } = req.body;
    
    console.log('Assigning class:', { assignedClass, assignedSection });

    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      {
        assignedClass: assignedClass || '',
        assignedSection: assignedSection || ''
      },
      { new: true }
    ).populate('userId', 'username');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({ 
      message: 'Class assignment updated successfully',
      teacher: {
        ...teacher.toObject(),
        assignedClass: teacher.assignedClass || null,
        assignedSection: teacher.assignedSection || null
      }
    });
  } catch (error) {
    console.error('Assign class error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/admin/teachers/:id
// @desc    Delete teacher
// @access  Private/Admin
router.delete('/teachers/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Delete user account
    await User.findByIdAndDelete(teacher.userId);

    // Delete teacher
    await Teacher.findByIdAndDelete(req.params.id);

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== LEAVE MANAGEMENT ==========

// @route   GET /api/admin/leaves
// @desc    Get all leave requests
// @access  Private/Admin
router.get('/leaves', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const leaves = await Leave.find(query)
      .populate('teacherId', 'name')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/leaves/:id
// @desc    Get single leave request
// @access  Private/Admin
router.get('/leaves/:id', async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('teacherId', 'name')
      .populate('reviewedBy', 'username');

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    res.json(leave);
  } catch (error) {
    console.error('Get leave error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/leaves/:id
// @desc    Approve/Reject leave
// @access  Private/Admin
router.put('/leaves/:id', async (req, res) => {
  try {
    const { status, adminResponse } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Please provide valid status (approved/rejected)' });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    if (adminResponse) leave.adminResponse = adminResponse;

    await leave.save();

    res.json({ message: `Leave ${status} successfully`, leave });
  } catch (error) {
    console.error('Update leave error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== FEEDBACK MANAGEMENT ==========

// @route   GET /api/admin/feedback
// @desc    Get all feedback
// @access  Private/Admin
router.get('/feedback', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const feedback = await Feedback.find(query)
      .populate('studentId', 'name class section')
      .populate('teacherId', 'name subject')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/feedback/:id
// @desc    Get single feedback
// @access  Private/Admin
router.get('/feedback/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('studentId', 'name class section')
      .populate('teacherId', 'name subject')
      .populate('reviewedBy', 'username');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/feedback/:id
// @desc    Update feedback status
// @access  Private/Admin
router.put('/feedback/:id', async (req, res) => {
  try {
    const { status, adminResponse } = req.body;

    if (!status || !['resolved', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Please provide valid status (resolved/pending)' });
    }

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.status = status;
    feedback.reviewedBy = req.user._id;
    if (adminResponse) feedback.adminResponse = adminResponse;

    await feedback.save();

    res.json({ message: `Feedback marked as ${status}`, feedback });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== FEE MANAGEMENT ==========

// @route   GET /api/admin/fees
// @desc    Get all fees
// @access  Private/Admin
router.get('/fees', async (req, res) => {
  try {
    const { studentId, status } = req.query;
    const query = {};
    
    if (studentId) query.studentId = studentId;
    if (status) query.status = status;

    const fees = await Fee.find(query)
      .populate('studentId', 'name class section')
      .populate('updatedBy', 'username')
      .populate('paymentHistory.recordedBy', 'username')
      .sort({ dueDate: 1 });

    res.json(fees);
  } catch (error) {
    console.error('Get fees error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/fees/:id
// @desc    Get single fee
// @access  Private/Admin
router.get('/fees/:id', async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id)
      .populate('studentId', 'name class section fatherMobile')
      .populate('updatedBy', 'username')
      .populate('paymentHistory.recordedBy', 'username');

    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    res.json(fee);
  } catch (error) {
    console.error('Get fee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/fees
// @desc    Add/Update fee
// @access  Private/Admin
router.post('/fees', async (req, res) => {
  try {
    const { studentId, class: studentClass, feeType, amount, dueDate, remarks } = req.body;

    if (!studentId || !studentClass || !feeType || !amount || !dueDate) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const fee = new Fee({
      studentId,
      class: studentClass,
      feeType,
      amount,
      dueDate: new Date(dueDate),
      status: 'pending',
      remarks,
      updatedBy: req.user._id
    });

    await fee.save();

    res.status(201).json({ message: 'Fee added successfully', fee });
  } catch (error) {
    console.error('Add fee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/fees/:id
// @desc    Update fee status or add payment
// @access  Private/Admin
router.put('/fees/:id', async (req, res) => {
  try {
    const { amountPaid, paidDate, paymentMethod, remarks, status } = req.body;

    const fee = await Fee.findById(req.params.id).populate('studentId');

    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    const previousAmountPaid = fee.amountPaid || 0;
    const paymentAmount = parseFloat(amountPaid) || 0;
    
    // If amountPaid is provided, add to payment
    if (paymentAmount > 0) {
      // Validate payment amount
      if (paymentAmount > (fee.amount - previousAmountPaid)) {
        return res.status(400).json({ 
          message: `Payment amount (₹${paymentAmount}) exceeds remaining balance (₹${fee.amount - previousAmountPaid})` 
        });
      }

      // Add to payment history
      fee.paymentHistory.push({
        amount: paymentAmount,
        paymentDate: paidDate ? new Date(paidDate) : new Date(),
        paymentMethod: paymentMethod || 'cash',
        remarks: remarks || '',
        recordedBy: req.user._id
      });

      // Update amount paid
      fee.amountPaid = (previousAmountPaid + paymentAmount);
      
      // Update status based on payment
      if (fee.amountPaid >= fee.amount) {
        fee.status = 'paid';
        fee.paidDate = paidDate ? new Date(paidDate) : new Date();
      } else if (fee.amountPaid > 0) {
        fee.status = 'partial';
      }

      // Update payment method if provided
      if (paymentMethod) fee.paymentMethod = paymentMethod;
      if (remarks) fee.remarks = remarks;
    } else if (status) {
      // Direct status update (for admin override)
      fee.status = status;
      if (status === 'paid' && !fee.paidDate) {
        fee.paidDate = new Date();
      }
    }

    fee.updatedBy = req.user._id;
    await fee.save();

    // Send notification if payment was made
    if (paymentAmount > 0 && fee.studentId) {
      try {
        // Calculate remaining fees for this student
        const allFees = await Fee.find({ 
          studentId: fee.studentId._id,
          status: { $in: ['pending', 'partial', 'overdue'] }
        });

        // Calculate total remaining (considering partial payments)
        const totalRemaining = allFees.reduce((sum, f) => {
          const remaining = f.amount - (f.amountPaid || 0);
          return sum + (remaining > 0 ? remaining : 0);
        }, 0);

        const paidDateStr = paidDate ? new Date(paidDate).toLocaleDateString() : new Date().toLocaleDateString();
        
        const { sendSMS, sendWhatsApp } = await import('../utils/sendSMS.js');
        const student = fee.studentId;
        const parentMobile = student.fatherMobile;

        // Format fee type for better readability
        const feeTypeFormatted = fee.feeType.charAt(0).toUpperCase() + fee.feeType.slice(1).replace('_', ' ');
        
        const remainingForThisFee = fee.amount - fee.amountPaid;
        
        let message = `💰 Fee Payment Received!\n\n` +
          `📚 Student: ${student.name}\n` +
          `🏫 Class: ${student.class}-${student.section}\n\n` +
          `💵 Payment Details:\n` +
          `   Fee Type: ${feeTypeFormatted}\n` +
          `   Amount Paid: ₹${paymentAmount}\n` +
          `   Payment Date: ${paidDateStr}\n` +
          `   Payment Method: ${paymentMethod || 'N/A'}\n\n` +
          `📊 Fee Status:\n` +
          `   Total Fee: ₹${fee.amount}\n` +
          `   Amount Paid: ₹${fee.amountPaid}\n` +
          `   Amount Left: ₹${remainingForThisFee}\n\n`;
        
        if (remainingForThisFee === 0) {
          message += `✅ This fee is now fully paid!\n\n`;
        } else {
          message += `⚠️ Remaining for this fee: ₹${remainingForThisFee}\n\n`;
        }

        if (totalRemaining > 0) {
          message += `📋 Total Remaining Fees: ₹${totalRemaining}\n\n`;
        } else {
          message += `🎉 All fees have been paid!\n\n`;
        }
        
        message += `Thank you for your payment!`;

        if (parentMobile) {
          await sendSMS(parentMobile, message);
          await sendWhatsApp(parentMobile, message);
        }
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
        // Don't fail the request if notification fails
      }
    }

    res.json({ 
      message: paymentAmount > 0 ? 'Payment recorded successfully' : 'Fee updated successfully', 
      fee 
    });
  } catch (error) {
    console.error('Update fee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/admin/fees/:id
// @desc    Delete fee
// @access  Private/Admin
router.delete('/fees/:id', async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    await Fee.findByIdAndDelete(req.params.id);

    res.json({ message: 'Fee deleted successfully' });
  } catch (error) {
    console.error('Delete fee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== STATISTICS ==========

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
    const pendingFeedback = await Feedback.countDocuments({ status: 'pending' });
    const pendingFees = await Fee.countDocuments({ status: 'pending' });

    res.json({
      totalStudents,
      totalTeachers,
      pendingLeaves,
      pendingFeedback,
      pendingFees
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== ATTENDANCE MANAGEMENT ==========

// @route   GET /api/admin/attendance
// @desc    Get attendance records
// @access  Private/Admin
router.get('/attendance', async (req, res) => {
  try {
    const { date, class: studentClass, section } = req.query;
    const query = {};
    
    if (date) query.date = new Date(date);
    if (studentClass) query.class = studentClass;
    if (section) query.section = section;

    const attendance = await Attendance.find(query)
      .populate('studentId', 'name class section')
      .sort({ date: -1, class: 1, section: 1 });

    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== MARK MANAGEMENT ==========

// @route   GET /api/admin/marks
// @desc    Get marks records
// @access  Private/Admin
router.get('/marks', async (req, res) => {
  try {
    const { examType, class: studentClass, section, subject } = req.query;
    const query = {};
    
    if (examType) query.examType = examType;
    if (studentClass) query.class = studentClass;
    if (section) query.section = section;
    if (subject) query.subject = subject;

    const marks = await Mark.find(query)
      .populate('studentId', 'name class section')
      .sort({ examType: 1, class: 1, section: 1 });

    res.json(marks);
  } catch (error) {
    console.error('Get marks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== USER MANAGEMENT ==========

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    const query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .populate('profileId')
      .sort({ role: 1, username: 1 });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (active/inactive)
// @access  Private/Admin
router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ message: 'Please provide isActive status' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, user });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;