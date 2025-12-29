import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard.css';

const StudentFees = () => {
  const [fees, setFees] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const response = await axios.get('/api/student/fees');
      setFees(response.data.fees);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Error fetching fees:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-section">
      <h2>My Fees</h2>

      {statistics && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>₹{statistics.totalFees}</h3>
              <p>Total Fees</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>₹{statistics.totalPaid}</h3>
              <p>Total Paid</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>₹{statistics.totalRemaining}</h3>
              <p>Remaining</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-info">
              <h3>₹{statistics.overdueFees}</h3>
              <p>Overdue</p>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Fee Type</th>
              <th>Total Amount</th>
              <th>Amount Paid</th>
              <th>Amount Left</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Payment History</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee) => {
              const amountPaid = fee.amountPaid || 0;
              const amountLeft = fee.amount - amountPaid;
              const paymentPercentage = fee.amount > 0 ? ((amountPaid / fee.amount) * 100).toFixed(1) : 0;
              
              return (
                <tr key={fee._id}>
                  <td><strong>{fee.feeType}</strong></td>
                  <td>₹{fee.amount}</td>
                  <td style={{ color: amountPaid > 0 ? '#28a745' : '#666' }}>
                    ₹{amountPaid.toFixed(2)}
                  </td>
                  <td style={{ 
                    color: amountLeft > 0 ? '#dc3545' : '#28a745', 
                    fontWeight: 'bold' 
                  }}>
                    ₹{amountLeft.toFixed(2)}
                  </td>
                  <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${fee.status}`}>
                      {fee.status}
                    </span>
                    {fee.status === 'partial' && (
                      <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#666' }}>
                        {paymentPercentage}% paid
                      </div>
                    )}
                  </td>
                  <td>
                    {fee.paymentHistory && fee.paymentHistory.length > 0 ? (
                      <details style={{ cursor: 'pointer' }}>
                        <summary style={{ color: '#667eea', fontSize: '0.9rem' }}>
                          View ({fee.paymentHistory.length})
                        </summary>
                        <div style={{ 
                          marginTop: '0.5rem', 
                          padding: '0.5rem', 
                          background: '#f8f9fa', 
                          borderRadius: '5px',
                          fontSize: '0.85rem'
                        }}>
                          {fee.paymentHistory.map((payment, idx) => (
                            <div key={idx} style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: idx < fee.paymentHistory.length - 1 ? '1px solid #ddd' : 'none' }}>
                              <strong>₹{payment.amount}</strong> on {new Date(payment.paymentDate).toLocaleDateString()}
                              <br />
                              <small style={{ color: '#666' }}>
                                Method: {payment.paymentMethod}
                                {payment.remarks && ` • ${payment.remarks}`}
                              </small>
                            </div>
                          ))}
                        </div>
                      </details>
                    ) : (
                      <span style={{ color: '#999', fontSize: '0.9rem' }}>No payments</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentFees;

