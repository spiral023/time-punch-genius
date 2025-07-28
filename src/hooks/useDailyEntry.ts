// src/hooks/useDailyEntry.ts
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const formatDateKey = (date: Date): string => `zehelper_data_${format(date, 'yyyy-MM-dd')}`;
const formatNotesKey = (date: Date): string => `zehelper_notes_${format(date, 'yyyy-MM-dd')}`;

export const useDailyEntry = (selectedDate: Date, updateYearData: (date: Date, input: string) => void) => {
  const [input, setInput] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const dateKey = formatDateKey(selectedDate);
    const notesKey = formatNotesKey(selectedDate);
    const savedInput = localStorage.getItem(dateKey) || '';
    const savedNotes = localStorage.getItem(notesKey) || '';
    setInput(savedInput);
    setNotes(savedNotes);
  }, [selectedDate]);

  useEffect(() => {
    const dateKey = formatDateKey(selectedDate);
    const currentData = localStorage.getItem(dateKey);
    if (input !== currentData) {
        if (input) {
            localStorage.setItem(dateKey, input);
        } else {
            localStorage.removeItem(dateKey);
        }
        updateYearData(selectedDate, input);
    }
  }, [input, selectedDate, updateYearData]);

  useEffect(() => {
    const notesKey = formatNotesKey(selectedDate);
    if (notes) {
      localStorage.setItem(notesKey, notes);
    } else {
      localStorage.removeItem(notesKey);
    }
  }, [notes, selectedDate]);

  return { input, setInput, notes, setNotes };
};
