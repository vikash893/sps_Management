import React, { useEffect, useState } from 'react';
import api from '../../../api/axios'
import ClassSectionFilter from '../../../components/ClassSectionFilter';
import '../Dashboard.css';
import './FeesManagement.css';

const FeesManagement = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [editingFee, setEditingFee] = useState(null);
  const [alertMessage, setAlertMessage] = useState({ type: '', text: '' });
  
  // Filter states
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFeeType, setFilterFeeType] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    studentId: '',
    class: '',
    feeType: 'tuition',
    amount: '',
    dueDate: '',
    remarks: ''
  });

  // Payment form states - MATCHING YOUR BACKEND
  const [paymentData, setPaymentData] = useState({
    amountPaid: '',
    paymentMethod: 'cash',
    remarks: '',
    paidDate: new Date().toISOString().split('T')[0]
  });

  // Fee types from your model enum
  const feeTypes = [
    { value: 'tuition', label: 'Tuition Fee' },
    { value: 'library', label: 'Library Fee' },
    { value: 'sports', label: 'Sports Fee' },
    { value: 'lab', label: 'Lab Fee' },
    { value: 'transport', label: 'Transport Fee' },
    { value: 'other', label: 'Other' }
  ];

  const paymentMethods = ['cash', 'online', 'cheque', 'other'];

  useEffect(() => {
    fetchFees();
    fetchStudents();
  }, []);

  const showAlert = (type, text, duration = 3000) => {
    setAlertMessage({ type, text });
    setTimeout(() => setAlertMessage({ type: '', text: '' }), duration);
  };

  const fetchFees = async () => {
    try {
      const res = await api.get('/api/admin/fees');
      console.log('Fees loaded:', res.data);
      setFees(res.data);
    } catch (err) {
      console.error('Error fetching fees', err);
      showAlert('error', 'Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/api/admin/students');
      console.log('Students loaded:', res.data);
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students', err);
      showAlert('error', 'Failed to load students');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openAddModal = () => {
    setEditingFee(null);
    setFormData({
      studentId: '',
      class: '',
      feeType: 'tuition',
      amount: '',
      dueDate: '',
      remarks: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (fee) => {
    setEditingFee(fee);
    setFormData({
      studentId: fee.studentId?._id || fee.studentId || '',
      class: fee.class || '',
      feeType: fee.feeType,
      amount: fee.amount,
      dueDate: fee.dueDate ? new Date(fee.dueDate).toISOString().split('T')[0] : '',
      remarks: fee.remarks || ''
    });
    setIsModalOpen(true);
  };

  const openPaymentModal = (fee) => {
    setSelectedFee(fee);
    setPaymentData({
      amountPaid: '',
      paymentMethod: 'cash',
      remarks: '',
      paidDate: new Date().toISOString().split('T')[0]
    });
    setIsPaymentModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get selected student for class
      const selectedStudent = students.find(s => s._id === formData.studentId);
      
      const feeData = {
        studentId: formData.studentId,
        class: selectedStudent?.class || formData.class, // Use from form if editing
        feeType: formData.feeType,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        remarks: formData.remarks
      };

      console.log('Submitting fee data:', feeData);

      if (editingFee) {
        const res = await axios.put(`/api/admin/fees/${editingFee._id}`, feeData);
        console.log('Update response:', res.data);
        showAlert('success', 'Fee updated successfully');
      } else {
        const res = await api.post('/api/admin/fees', feeData);
        console.log('Create response:', res.data);
        showAlert('success', 'Fee added successfully');
      }
      fetchFees();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving fee', err.response?.data || err);
      showAlert('error', err.response?.data?.message || 'Failed to save fee');
    }
  };

  // FIXED: Using PUT /api/admin/fees/:id for payments (matching your backend)
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFee) return;

    try {
      const paymentAmount = parseFloat(paymentData.amountPaid);
      
      // Validate payment amount
      if (paymentAmount <= 0) {
        showAlert('error', 'Payment amount must be greater than 0');
        return;
      }

      // Prepare payment data matching your backend
      const paymentPayload = {
        amountPaid: paymentAmount,
        paymentMethod: paymentData.paymentMethod,
        remarks: paymentData.remarks,
        paidDate: paymentData.paidDate
      };

      console.log('Sending payment to PUT /api/admin/fees/:id:', {
        feeId: selectedFee._id,
        data: paymentPayload
      });

      const res = await api.put(`/api/admin/fees/${selectedFee._id}`, paymentPayload);
      
      console.log('Payment response:', res.data);
      showAlert('success', res.data.message || 'Payment recorded successfully');
      
      // Update local state
      setFees(prevFees => prevFees.map(fee => 
        fee._id === selectedFee._id ? res.data.fee : fee
      ));
      
      setIsPaymentModalOpen(false);
      setSelectedFee(null);
      
    } catch (err) {
      console.error('Error recording payment:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMsg = err.response?.data?.message || 'Failed to record payment';
      showAlert('error', errorMsg);
    }
  };

  const handleDeleteFee = async (feeId) => {
    if (!window.confirm('Are you sure you want to delete this fee record?')) return;

    try {
      // Note: You need to add a DELETE route in your backend
      await api.delete(`/api/admin/fees/${feeId}`);
      showAlert('success', 'Fee deleted successfully');
      fetchFees();
    } catch (err) {
      console.error('Error deleting fee', err);
      showAlert('error', 'Failed to delete fee');
    }
  };

  const calculateStats = () => {
    const filteredFees = fees.filter(f => {
      if (filterClass && f.class !== filterClass) return false;
      if (filterSection && f.section !== filterSection) return false;
      if (filterStudent && f.studentId?._id !== filterStudent) return false;
      if (filterStatus && f.status !== filterStatus) return false;
      if (filterFeeType && f.feeType !== filterFeeType) return false;
      return true;
    });

    const totalAmount = filteredFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const totalPaid = filteredFees.reduce((sum, fee) => sum + (fee.amountPaid || 0), 0);
    const totalPending = totalAmount - totalPaid;
    const totalStudents = new Set(filteredFees.map(f => f.studentId?._id)).size;

    return { totalAmount, totalPaid, totalPending, totalStudents };
  };

  const stats = calculateStats();

  if (loading) return <div className="loading">Loading fees...</div>;

  return (
    <div className="dashboard-section">
      {/* Alert Message */}
      {alertMessage.text && (
        <div className={`alert alert-${alertMessage.type}`}>
          {alertMessage.text}
          <button onClick={() => setAlertMessage({ type: '', text: '' })}>×</button>
        </div>
      )}

      <div className="section-header">
        <h2>Student Fees Management</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus"></i> Add New Fee
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">₹{stats.totalAmount.toLocaleString()}</div>
          <div className="stat-label">Total Fees</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#12fa12ff' }}>
            ₹{stats.totalPaid.toLocaleString()}
          </div>
          <div className="stat-label">Total Paid</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#dc3545' }}>
            ₹{stats.totalPending.toLocaleString()}
          </div>
          <div className="stat-label">Total Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </div>
      </div>

      {/* Filters */}
      <div className="form-card">
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <ClassSectionFilter
            selectedClass={filterClass}
            selectedSection={filterSection}
            onClassChange={setFilterClass}
            onSectionChange={setFilterSection}
          />

          <div className="form-group">
            <label>Student</label>
            <select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
            >
              <option value="">All Students</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} - {student.class}-{student.section}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fee Type</label>
            <select
              value={filterFeeType}
              onChange={(e) => setFilterFeeType(e.target.value)}
            >
              <option value="">All Types</option>
              {feeTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fees Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Class-Section</th>
              <th>Fee Type</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fees
              .filter(fee => {
                if (filterClass && fee.class !== filterClass) return false;
                if (filterSection && fee.section !== filterSection) return false;
                if (filterStudent && fee.studentId?._id !== filterStudent) return false;
                if (filterStatus && fee.status !== filterStatus) return false;
                if (filterFeeType && fee.feeType !== filterFeeType) return false;
                return true;
              })
              .map((fee) => {
                const paid = fee.amountPaid || 0;
                const remaining = fee.amount - paid;
                const isOverdue = new Date(fee.dueDate) < new Date() && remaining > 0;
                const feeTypeLabel = feeTypes.find(t => t.value === fee.feeType)?.label || fee.feeType;

                return (
                  <tr key={fee._id}>
                    <td>{fee.studentId?.name || 'N/A'}</td>
                    <td>{fee.class || fee.studentId?.class || ''}-{fee.section || fee.studentId?.section || ''}</td>
                    <td>{feeTypeLabel}</td>
                    <td>₹{fee.amount?.toFixed(2) || '0.00'}</td>
                    <td style={{ color: '#28a745' }}>₹{paid.toFixed(2)}</td>
                    <td style={{ color: remaining > 0 ? '#dc3545' : '#28a745' }}>
                      ₹{remaining.toFixed(2)}
                    </td>
                    <td className={isOverdue ? 'text-danger' : ''}>
                      {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'}
                      {isOverdue && <i className="fas fa-exclamation-circle ml-1"></i>}
                    </td>
                    <td>
                      <span className={`status-badge status-${fee.status}`}>
                        {fee.status}
                        {isOverdue && fee.status !== 'paid' && ' (Overdue)'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {fee.status !== 'paid' && (
                          <button
                            className="btn-icon btn-success"
                            onClick={() => openPaymentModal(fee)}
                            title="Record Payment"
                          >Update Fee
                            <i className="fas fa-money-bill"></i>
                          </button>
                        )}
                        <button
                          className="btn-icon btn-primary"
                          onClick={() => openEditModal(fee)}
                          title="Edit"
                        >Edit fee
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleDeleteFee(fee._id)}
                          title="Delete"
                        >Delete fee 
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Fee Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingFee ? 'Edit Fee' : 'Add New Fee'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label>Student *</label>
                    <select
                      name="studentId"
                      value={formData.studentId}
                      onChange={(e) => {
                        const studentId = e.target.value;
                        const selectedStudent = students.find(s => s._id === studentId);
                        setFormData(prev => ({
                          ...prev,
                          studentId,
                          class: selectedStudent?.class || ''
                        }));
                      }}
                      required
                      disabled={!!editingFee}
                    >
                      <option value="">Select Student</option>
                      {students.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.name} - {student.class}-{student.section}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Class *</label>
                    <input
                      type="text"
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., 10"
                    />
                  </div>

                  <div className="form-group">
                    <label>Fee Type *</label>
                    <select
                      name="feeType"
                      value={formData.feeType}
                      onChange={handleInputChange}
                      required
                    >
                      {feeTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Amount (₹) *</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Due Date *</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Remarks</label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Any additional notes"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingFee ? 'Update Fee' : 'Add Fee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedFee && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Record Payment</h3>
              <button className="modal-close" onClick={() => setIsPaymentModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit}>
              <div className="modal-body">
                <div className="payment-info">
                  <p><strong>Student:</strong> {selectedFee.studentId?.name || 'N/A'}</p>
                  <p><strong>Fee Type:</strong> {feeTypes.find(t => t.value === selectedFee.feeType)?.label || selectedFee.feeType}</p>
                  <p><strong>Total Amount:</strong> ₹{selectedFee.amount?.toFixed(2) || '0.00'}</p>
                  <p><strong>Already Paid:</strong> ₹{(selectedFee.amountPaid || 0).toFixed(2)}</p>
                  <p><strong>Balance Due:</strong> ₹{(selectedFee.amount - (selectedFee.amountPaid || 0)).toFixed(2)}</p>
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label>Amount to Pay (₹) *</label>
                    <input
                      type="number"
                      name="amountPaid"
                      value={paymentData.amountPaid}
                      onChange={handlePaymentInputChange}
                      min="0.01"
                      step="0.01"
                      max={selectedFee.amount - (selectedFee.amountPaid || 0)}
                      required
                    />
                    <small className="text-muted">
                      Maximum: ₹{(selectedFee.amount - (selectedFee.amountPaid || 0)).toFixed(2)}
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Payment Date *</label>
                    <input
                      type="date"
                      name="paidDate"
                      value={paymentData.paidDate}
                      onChange={handlePaymentInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Payment Method *</label>
                    <select
                      name="paymentMethod"
                      value={paymentData.paymentMethod}
                      onChange={handlePaymentInputChange}
                      required
                    >
                      {paymentMethods.map(method => (
                        <option key={method} value={method}>
                          {method.charAt(0).toUpperCase() + method.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Remarks</label>
                    <textarea
                      name="remarks"
                      value={paymentData.remarks}
                      onChange={handlePaymentInputChange}
                      rows="3"
                      placeholder="Any additional notes"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsPaymentModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesManagement;