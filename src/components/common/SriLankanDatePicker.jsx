/**
 * SriLankanDatePicker Component
 * 
 * Custom date picker that highlights Sri Lankan public holidays
 * and Poya days in the calendar view.
 */

import React, { useMemo } from 'react';
import { TextField, Box, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getHolidayMap } from '../../utils/sriLankanHolidays';

// Custom styled TextField with holiday indicators
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: '#fff',
  },
}));

/**
 * SriLankanDatePicker component
 * 
 * @param {Object} props
 * @param {string} props.label - Label for the date picker
 * @param {string} props.value - Current date value (YYYY-MM-DD format)
 * @param {Function} props.onChange - Change handler
 * @param {string} props.name - Input name
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.minDate - Minimum selectable date (YYYY-MM-DD)
 * @param {string} props.maxDate - Maximum selectable date (YYYY-MM-DD)
 * @param {boolean} props.disabled - Whether the field is disabled
 * @param {boolean} props.fullWidth - Whether to take full width
 * @param {string} props.size - Size variant ('small', 'medium')
 * @param {Object} props.sx - Additional styles
 */
const SriLankanDatePicker = ({
  label,
  value,
  onChange,
  name,
  required = false,
  minDate,
  maxDate,
  disabled = false,
  fullWidth = true,
  size = 'small',
  sx = {},
  ...otherProps
}) => {
  // Get holiday information for the selected date
  const selectedDateInfo = useMemo(() => {
    if (!value) return null;
    
    const date = new Date(value);
    const year = date.getFullYear();
    const holidayMap = getHolidayMap(year);
    
    return holidayMap[value] || null;
  }, [value]);

  // Helper text showing if selected date is a holiday
  const helperText = useMemo(() => {
    if (selectedDateInfo) {
      return `⚠️ ${selectedDateInfo} - This is a public holiday`;
    }
    return '';
  }, [selectedDateInfo]);

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <StyledTextField
        label={label}
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        fullWidth={fullWidth}
        size={size}
        required={required}
        disabled={disabled}
        InputLabelProps={{ 
          shrink: true,
          required: required 
        }}
        inputProps={{
          min: minDate,
          max: maxDate,
        }}
        helperText={helperText}
        FormHelperTextProps={{
          sx: {
            color: selectedDateInfo ? 'warning.main' : 'text.secondary',
            fontWeight: selectedDateInfo ? 600 : 400,
          }
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: selectedDateInfo ? '#FFF9E6' : '#fff',
            '& fieldset': {
              borderColor: selectedDateInfo ? '#FFC107' : undefined,
              borderWidth: selectedDateInfo ? 2 : 1,
            },
            '&:hover fieldset': {
              borderColor: selectedDateInfo ? '#FFB300' : undefined,
            },
            '&.Mui-focused fieldset': {
              borderColor: selectedDateInfo ? '#FFA000' : undefined,
            },
          },
        }}
        {...otherProps}
      />
      
      {/* Holiday indicator badge */}
      {selectedDateInfo && (
        <Tooltip title={selectedDateInfo} arrow placement="top">
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#FFC107',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              cursor: 'help',
              zIndex: 1,
            }}
          >
            🏖️
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default SriLankanDatePicker;
