import React from 'react';
import './ClassSectionFilter.css';

const ClassSectionFilter = ({ selectedClass, selectedSection, onClassChange, onSectionChange }) => {
  const classes = [
    'Play', 'Nursery', 'LKG', 'UKG',
    '1st', '2nd', '3rd', '4th', '5th',
    '6th', '7th', '8th', '9th', '10th',
    '11th', '12th'
  ];

  const sections = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="class-section-filter">
      <div className="filter-group">
        <label>Class</label>
        <select value={selectedClass} onChange={(e) => onClassChange(e.target.value)}>
          <option value="">All Classes</option>
          {classes.map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Section</label>
        <select value={selectedSection} onChange={(e) => onSectionChange(e.target.value)}>
          <option value="">All Sections</option>
          {sections.map(sec => (
            <option key={sec} value={sec}>{sec}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ClassSectionFilter;



