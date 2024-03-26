import React, { useState } from 'react';
import { addUserHours } from '../UserUtils';

const ScheduleModal = ({ onClose, userId, className, classId  }) => {
  const [selectedSlots, setSelectedSlots] = useState(new Set());

  const handleSlotSelection = (day, slot) => {
    const slotKey = `${day}-${slot}`;
    setSelectedSlots(prevSelectedSlots => {
      const newSelectedSlots = new Set(prevSelectedSlots);
      if (newSelectedSlots.has(slotKey)) {
        newSelectedSlots.delete(slotKey);
      } else {
        newSelectedSlots.add(slotKey);
      }
      return newSelectedSlots;
    });
  };

  const handleSubmit = async () => {
    const selectedHours = Array.from(selectedSlots);

    addUserHours(userId, className, classId, selectedHours)
    .then(response => {
      if (response) {
        alert("Office hours updated successfully.");
        onClose();
      } else {
        alert("Failed to update office hours.");
      }
    })
    .catch(error => {
      console.error("Error when adding user hours:", error);
      alert("An error occurred while updating office hours.");
    });
  };
  const formatTime = (hour, minutes) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour}:${minutes} ${ampm}`;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 22; hour++) {
      slots.push(formatTime(hour, '00'));
      slots.push(formatTime(hour, '30'));
    }
    return slots;
  };

  const days = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];
  const timeSlots = generateTimeSlots();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="relative mx-auto shadow-lg rounded-lg bg-white max-h-[80vh] w-full max-w-4xl">
        <div className="text-center text-lg leading-6 font-medium text-gray-900 py-5">Set Office Hours</div>
        <div className="overflow-auto max-h-[60vh]">
          <table className="table-fixed w-full">
            <thead className="sticky top-0 bg-white">
              <tr className="bg-gray-50">
                <th className="p-2 text-center">Time</th>
                {days.map(day => (
                  <th key={day} className="p-2 text-center border-l border-gray-300">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(time => (
                <tr key={time}>
                  <td className="p-2 border-b border-gray-200 text-center">{time}</td>
                  {days.map(day => {
                    const slotKey = `${day}-${time}`;
                    return (
                      <td
                        key={slotKey}
                        className={`p-2 border-b border-gray-200 text-center ${selectedSlots.has(slotKey) ? 'bg-indigo-500' : 'hover:bg-indigo-100 cursor-pointer'} border-l border-gray-300`}
                        onClick={() => handleSlotSelection(day, time)}
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end p-5 border-t border-gray-200">
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded m-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded m-2"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;