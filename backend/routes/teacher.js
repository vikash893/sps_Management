import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import Mark from '../models/Mark.js';
import Leave from '../models/Leave.js';
import Fee from '../models/Fee.js';
import EarlyLeave from '../models/EarlyLeave.js';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js'; // Added User import
import { sendSMS, sendWhatsApp } from '../utils/sendSMS.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// ========== MULTER CONFIGURATION ==========
// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads/students';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'student-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// All routes require teacher authentication
router.use(protect);
router.use(authorize('teacher'));

// ========== TEACHER PROFILE ==========

// @route   GET /api/teacher/profile
// @desc    Get teacher profile with assigned class/section
// @access  Private/Teacher
router.get('/profile', async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }
    
    res.json({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      subject: teacher.subject,
      assignedClass: teacher.assignedClass || null,
      assignedSection: teacher.assignedSection || null,
      assignedClasses: teacher.assignedClasses || []
    });
  } catch (error) {
    console.error('Get teacher profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== STUDENTS MANAGEMENT ==========

// @route   GET /api/teacher/students
// @desc    Get students for teacher (two modes)
// @access  Private/Teacher
router.get('/students', async (req, res) => {
  try {
    const { class: studentClass, section } = req.query;
    
    // Mode 1: If class and section provided in query (for attendance/marks)
    if (studentClass && section) {
      const students = await Student.find({ 
        class: studentClass, 
        section: section 
      }).sort({ name: 1 });
      
      return res.json(students);
    }
    
    // Mode 2: Get teacher's assigned class students
    const teacher = await Teacher.findOne({ userId: req.user._id });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }
    
    // If teacher has no assigned class, return empty
    if (!teacher.assignedClass) {
      return res.json([]);
    }
    
    const query = {};
    
    if (teacher.assignedClass) {
      query.class = teacher.assignedClass;
    }
    
    if (teacher.assignedSection) {
      query.section = teacher.assignedSection;
    }
    
    const students = await Student.find(query).sort({ name: 1 });

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/teacher/students/add
// @desc    Add a new student to teacher's assigned class
// @access  Private/Teacher
router.post('/students/add', upload.single('photo'), async (req, res) => {
  try {
    console.log('📝 TEACHER ADDING STUDENT...');
    
    const { name, class: studentClass, section, dob, fatherName, fatherMobile, motherName, address } = req.body;

    // Validate required fields
    if (!name || !studentClass || !section || !dob || !fatherMobile) {
      return res.status(400).json({ 
        message: 'Please provide all required fields (Name, Class, Section, DOB, Father Mobile)' 
      });
    }

    // Get teacher profile to check authorization
    const teacher = await Teacher.findOne({ userId: req.user._id });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    // Check if teacher is authorized to add to this class/section
    let isAuthorized = false;
    
    // Check main assigned class
    if (teacher.assignedClass && teacher.assignedSection) {
      if (teacher.assignedClass === studentClass && teacher.assignedSection === section) {
        isAuthorized = true;
      }
    }
    
    // Check assignedClasses array
    if (!isAuthorized && teacher.assignedClasses && teacher.assignedClasses.length > 0) {
      isAuthorized = teacher.assignedClasses.some(cls => 
        cls.class === studentClass && cls.section === section
      );
    }

    if (!isAuthorized) {
      return res.status(403).json({ 
        message: `You are not authorized to add students to Class ${studentClass} - Section ${section}` 
      });
    }

    // ========== CREATE USER ACCOUNT (Same as admin) ==========
    // Format DOB as password (DDMMYYYY)
    const dobDate = new Date(dob);
    const day = String(dobDate.getDate()).padStart(2, '0');
    const month = String(dobDate.getMonth() + 1).padStart(2, '0');
    const year = dobDate.getFullYear();
    const defaultPassword = `${day}${month}${year}`;
    console.log('🔑 Default password generated:', defaultPassword);

    // Generate username (firstname_lastname_class_section)
    const usernameBase = `${name.toLowerCase().replace(/\s+/g, '_')}_${studentClass}_${section}`;
    console.log('👤 Base username:', usernameBase);

    // Check if username exists
    let finalUsername = usernameBase;
    let counter = 1;
    while (await User.findOne({ username: finalUsername })) {
      finalUsername = `${usernameBase}_${counter}`;
      counter++;
    }
    console.log('✅ Final username:', finalUsername);

    // Generate email
    const email = `${finalUsername}@school.com`;

    // Create user
    const user = new User({
      username: finalUsername,
      password: defaultPassword,
      role: 'student',
      email: email,
      phone: fatherMobile,
      isActive: true
    });

    await user.save();
    console.log('✅ User account created:', user._id);

    // ========== CREATE STUDENT PROFILE (Same as admin) ==========
    // Handle file upload
    let photoPath = '';
    if (req.file) {
      photoPath = `/uploads/${req.file.filename}`;
      console.log('📸 Photo path:', photoPath);
    }

    // Create student profile
    const student = new Student({
      name,
      class: studentClass,
      section,
      dob: dobDate,
      fatherName: fatherName || '',
      fatherMobile,
      motherName: motherName || '',
      address: address || '',
      photo: photoPath,
      userId: user._id
    });

    await student.save();
    console.log('✅ Student profile created:', student._id);

    // Update user with profile reference
    user.profileId = student._id;
    user.roleRef = 'Student';
    await user.save();
    console.log('✅ User updated with profile reference');

    console.log('='.repeat(50));
    console.log('🎉 STUDENT ADDED SUCCESSFULLY BY TEACHER');
    console.log('📋 Student Details:');
    console.log('- Name:', name);
    console.log('- Class/Section:', studentClass, section);
    console.log('- Username:', finalUsername);
    console.log('- Password:', defaultPassword);
    console.log('='.repeat(50));

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      student: {
        _id: student._id,
        name: student.name,
        class: student.class,
        section: student.section,
        dob: student.dob,
        fatherMobile: student.fatherMobile,
        photo: student.photo,
        username: finalUsername,
        defaultPassword: defaultPassword
      }
    });
  } catch (error) {
    console.error('❌ Add student error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors 
      });
    }
    
    // Handle duplicate username/email
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Username already exists. Please try again.' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   DELETE /api/teacher/students/:id
// @desc    Delete a student from teacher's assigned class
// @access  Private/Teacher
router.delete('/students/:id', async (req, res) => {
  try {
    console.log('🗑️ Teacher deleting student:', req.params.id);
    
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get teacher profile
    const teacher = await Teacher.findOne({ userId: req.user._id });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    // Check if teacher is authorized to delete from this class/section
    let isAuthorized = false;
    
    // Check main assigned class
    if (teacher.assignedClass && teacher.assignedSection) {
      if (teacher.assignedClass === student.class && teacher.assignedSection === student.section) {
        isAuthorized = true;
      }
    }
    
    // Check assignedClasses array
    if (!isAuthorized && teacher.assignedClasses && teacher.assignedClasses.length > 0) {
      isAuthorized = teacher.assignedClasses.some(cls => 
        cls.class === student.class && cls.section === student.section
      );
    }

    if (!isAuthorized) {
      return res.status(403).json({ 
        message: 'You are not authorized to delete students from this class/section' 
      });
    }

    // Find and delete the associated user account
    const user = await User.findOne({ 
      profileId: student._id, 
      roleRef: 'Student' 
    });
    
    if (user) {
      await User.findByIdAndDelete(user._id);
      console.log('✅ Associated user account deleted:', user._id);
    }

    // Delete student profile
    await Student.findByIdAndDelete(req.params.id);
    console.log('✅ Student profile deleted:', req.params.id);

    res.json({ 
      success: true,
      message: 'Student and associated account deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Delete student error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// ========== FEES MANAGEMENT ==========

// @route   GET /api/teacher/fees
// @desc    Get fees for teacher's assigned class
// @access  Private/Teacher
router.get('/fees', async (req, res) => {
  try {
    console.log('📊 Fetching fees for teacher...');
    
    // Get teacher's assigned class/section
    const teacher = await Teacher.findOne({ userId: req.user._id });
    
    if (!teacher) {
      console.log('❌ Teacher profile not found');
      return res.status(404).json({ message: 'Teacher profile not found' });
    }
    
    console.log('👨‍🏫 Teacher info:', {
      name: teacher.name,
      assignedClass: teacher.assignedClass,
      assignedSection: teacher.assignedSection
    });
    
    // If teacher has no assigned class, return empty
    if (!teacher.assignedClass) {
      console.log('⚠️ Teacher has no assigned class');
      return res.json([]);
    }
    
    // Step 1: Find ALL students in teacher's assigned class/section
    const studentQuery = {
      class: teacher.assignedClass
    };
    
    if (teacher.assignedSection) {
      studentQuery.section = teacher.assignedSection;
    }
    
    console.log('🔍 Student query:', studentQuery);
    
    const students = await Student.find(studentQuery).select('_id name class section fatherMobile');
    const studentIds = students.map(s => s._id);
    
    console.log('👥 Found students:', {
      count: students.length,
      studentNames: students.map(s => s.name)
    });
    
    if (studentIds.length === 0) {
      console.log('📭 No students found in this class/section');
      return res.json([]);
    }
    
    // Step 2: Find fees for these specific students
    console.log('💰 Looking for fees for student IDs:', studentIds);
    
    const fees = await Fee.find({ 
      studentId: { $in: studentIds }
    })
    .populate({
      path: 'studentId',
      select: 'name class section fatherMobile'
    })
    .populate('paymentHistory.recordedBy', 'username')
    .sort({ dueDate: 1 });
    
    console.log('✅ Found fees:', fees.length, 'records');
    
    // Format the response to include section from student (not fee)
    const formattedFees = fees.map(fee => {
      const feeObj = fee.toObject();
      // Ensure section is taken from student if fee doesn't have it
      if (!feeObj.section && feeObj.studentId?.section) {
        feeObj.section = feeObj.studentId.section;
      }
      // Ensure class is taken from student if fee doesn't have it
      if (!feeObj.class && feeObj.studentId?.class) {
        feeObj.class = feeObj.studentId.class;
      }
      return feeObj;
    });
    
    res.json(formattedFees);
  } catch (error) {
    console.error('❌ Get teacher fees error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ========== ATTENDANCE MANAGEMENT ==========

// @route   GET /api/teacher/attendance/students
// @desc    Get students by class and section for attendance
// @access  Private/Teacher
router.get('/attendance/students', async (req, res) => {
  try {
    const { class: studentClass, section } = req.query;

    if (!studentClass || !section) {
      return res.status(400).json({ message: 'Please provide class and section' });
    }

    const students = await Student.find({ 
      class: studentClass, 
      section: section 
    }).sort({ name: 1 });

    res.json(students);
  } catch (error) {
    console.error('Get attendance students error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/teacher/attendance
// @desc    Mark attendance
// @access  Private/Teacher
router.post('/attendance', async (req, res) => {
  try {
    const { class: studentClass, section, subject, date, attendance } = req.body;

    if (!studentClass || !section || !subject || !date || !Array.isArray(attendance)) {
      return res.status(400).json({ message: 'Please provide class, section, subject, date, and attendance array' });
    }

    const attendanceRecords = attendance.map(record => ({
      studentId: record.studentId,
      class: studentClass,
      section: section,
      subject: subject,
      date: new Date(date),
      status: record.status,
      markedBy: req.user._id
    }));

    // Remove existing attendance for the same date and subject
    await Attendance.deleteMany({
      class: studentClass,
      section: section,
      subject: subject,
      date: new Date(date)
    });

    // Insert new attendance
    const savedAttendance = await Attendance.insertMany(attendanceRecords);

    res.status(201).json({ 
      message: 'Attendance marked successfully', 
      attendance: savedAttendance 
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/teacher/attendance
// @desc    Get attendance by class and section
// @access  Private/Teacher
router.get('/attendance', async (req, res) => {
  try {
    const { class: studentClass, section, subject, date } = req.query;

    if (!studentClass || !section || !date) {
      return res.status(400).json({ message: 'Please provide class, section, and date' });
    }

    const query = {
      class: studentClass,
      section: section,
      date: new Date(date)
    };

    if (subject && subject !== 'all') {
      query.subject = subject;
    }

    const attendance = await Attendance.find(query).populate('studentId', 'name');

    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/teacher/attendance/stats
// @desc    Get attendance statistics by subject
// @access  Private/Teacher
router.get('/attendance/stats', async (req, res) => {
  try {
    const { class: studentClass, section, subject, startDate, endDate } = req.query;

    if (!studentClass || !section) {
      return res.status(400).json({ message: 'Please provide class and section' });
    }

    const query = {
      class: studentClass,
      section: section
    };

    if (subject && subject !== 'all') {
      query.subject = subject;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query).populate('studentId', 'name');

    // Group by subject and calculate statistics
    const statsBySubject = {};
    const allSubjects = new Set();

    attendance.forEach(record => {
      const subj = record.subject || 'all';
      allSubjects.add(subj);
      
      if (!statsBySubject[subj]) {
        statsBySubject[subj] = {
          subject: subj,
          totalClasses: 0,
          present: 0,
          absent: 0,
          late: 0,
          students: {}
        };
      }

      const stats = statsBySubject[subj];
      const studentId = record.studentId._id.toString();
      
      if (!stats.students[studentId]) {
        stats.students[studentId] = { present: 0, absent: 0, late: 0 };
      }

      if (record.status === 'present') {
        stats.present++;
        stats.students[studentId].present++;
      } else if (record.status === 'absent') {
        stats.absent++;
        stats.students[studentId].absent++;
      } else if (record.status === 'late') {
        stats.late++;
        stats.students[studentId].late++;
      }
    });

    // Calculate total classes per subject (unique dates)
    Object.keys(statsBySubject).forEach(subj => {
      const uniqueDates = new Set();
      attendance
        .filter(r => (r.subject || 'all') === subj)
        .forEach(r => uniqueDates.add(r.date.toISOString().split('T')[0]));
      statsBySubject[subj].totalClasses = uniqueDates.size;
    });

    res.json({
      statsBySubject: Object.values(statsBySubject),
      allSubjects: Array.from(allSubjects)
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== MARKS MANAGEMENT ==========

// @route   POST /api/teacher/marks
// @desc    Upload marks
// @access  Private/Teacher
router.post('/marks', async (req, res) => {
  try {
    const { class: studentClass, section, subject, examType, marks } = req.body;

    if (!studentClass || !section || !subject || !examType || !Array.isArray(marks)) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const markRecords = marks.map(record => ({
      studentId: record.studentId,
      class: studentClass,
      section: section,
      subject: subject,
      examType: examType,
      marksObtained: record.marksObtained,
      totalMarks: record.totalMarks,
      uploadedBy: req.user._id
    }));

    const savedMarks = await Mark.insertMany(markRecords);

    res.status(201).json({ 
      message: 'Marks uploaded successfully', 
      marks: savedMarks 
    });
  } catch (error) {
    console.error('Upload marks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/teacher/marks
// @desc    Get marks by class and section
// @access  Private/Teacher
router.get('/marks', async (req, res) => {
  try {
    const { class: studentClass, section, subject, examType } = req.query;

    const query = {};
    if (studentClass) query.class = studentClass;
    if (section) query.section = section;
    if (subject) query.subject = subject;
    if (examType) query.examType = examType;

    const marks = await Mark.find(query)
      .populate('studentId', 'name')
      .sort({ createdAt: -1 });

    res.json(marks);
  } catch (error) {
    console.error('Get marks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== LEAVE MANAGEMENT ==========

// @route   POST /api/teacher/leaves
// @desc    Apply for leave
// @access  Private/Teacher
router.post('/leaves', async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Please provide start date, end date, and reason' });
    }

    const teacher = await Teacher.findOne({ userId: req.user._id });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    const leave = new Leave({
      teacherId: teacher._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason: reason,
      status: 'pending'
    });

    await leave.save();

    res.status(201).json({ 
      message: 'Leave application submitted successfully', 
      leave 
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/teacher/leaves
// @desc    Get teacher's leave applications
// @access  Private/Teacher
router.get('/leaves', async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    const leaves = await Leave.find({ teacherId: teacher._id })
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== EARLY STUDENT LEAVE ==========

// @route   POST /api/teacher/early-leave
// @desc    Mark early student leave and send SMS/WhatsApp
// @access  Private/Teacher
router.post('/early-leave', async (req, res) => {
  try {
    const { studentId, pickupPersonName, relation } = req.body;

    if (!studentId || !pickupPersonName || !relation) {
      return res.status(400).json({ 
        message: 'Please provide student ID, pickup person name, and relation' 
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const leaveTime = new Date();
    const timeString = leaveTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    // Create early leave record
    const earlyLeave = new EarlyLeave({
      studentId: student._id,
      studentName: student.name,
      class: student.class,
      section: student.section,
      pickupPersonName: pickupPersonName,
      relation: relation,
      leaveTime: leaveTime,
      parentMobile: student.fatherMobile,
      markedBy: req.user._id
    });

    // Send SMS/WhatsApp to parent
    const message = `Your child ${student.name} left school at ${timeString} with ${pickupPersonName}, Relation: ${relation}`;
    
    let smsResult = { success: false };
    let whatsappResult = { success: false };

    // Try SMS first
    if (student.fatherMobile) {
      smsResult = await sendSMS(student.fatherMobile, message);
      
      // Also try WhatsApp
      whatsappResult = await sendWhatsApp(student.fatherMobile, message);
    }

    // Update early leave record with SMS status
    if (smsResult.success || whatsappResult.success) {
      earlyLeave.smsSent = true;
      earlyLeave.smsStatus = 'sent';
    } else {
      earlyLeave.smsStatus = 'failed';
    }

    await earlyLeave.save();

    res.status(201).json({ 
      message: 'Early leave recorded and notification sent', 
      earlyLeave: {
        ...earlyLeave.toObject(),
        smsResult,
        whatsappResult
      }
    });
  } catch (error) {
    console.error('Early leave error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/teacher/early-leaves
// @desc    Get early leave records
// @access  Private/Teacher
router.get('/early-leaves', async (req, res) => {
  try {
    const { class: studentClass, section, date } = req.query;

    const query = {};
    if (studentClass) query.class = studentClass;
    if (section) query.section = section;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.leaveTime = { $gte: startDate, $lte: endDate };
    }

    const earlyLeaves = await EarlyLeave.find(query)
      .populate('studentId', 'name class section')
      .sort({ leaveTime: -1 });

    res.json(earlyLeaves);
  } catch (error) {
    console.error('Get early leaves error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;