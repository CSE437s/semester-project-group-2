import React from 'react';

const TAHoursModal = ({ hoursData, tas, onClose }) => {
  if (!hoursData || !tas) {
    return <p>Data is loading or not available...</p>;
  }

  const days = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];
  const daySlots = 28; 

  const timeSlots = [];
  for (let i = 0; i < daySlots; i++) {
    const hour = Math.floor(i / 2) + 8; 
    const minute = i % 2 === 0 ? '00' : '30';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    timeSlots.push(`${hour % 12 === 0 ? 12 : hour % 12}:${minute} ${ampm}`);
  }

  const predefinedColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
    'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-indigo-500', 'bg-lime-500'
  ];

  const colorMapping = tas.reduce((acc, ta, index) => {
    acc[ta._id] = predefinedColors[index % predefinedColors.length]; // Assign a predefined color based on TA index
    return acc;
  }, {});

  return (
<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
  <div className="relative mx-auto shadow-lg rounded-lg bg-white max-h-[90vh] w-full max-w-4xl">
    <div className="text-center text-lg leading-6 font-medium text-gray-900 py-5">TA Office Hours</div>
    <div className="flex justify-start mr-8 mt-4 overflow-x-scroll">
      {tas.map((ta, index) => (
        <div key={ta._id} className="flex ml-4">
          <span className={`inline-block w-4 mt-2 h-4 mr-2 mb-2 ${colorMapping[ta._id]}`}></span>
          <span className="mb-2">{`${ta.firstName} ${ta.lastName}`}</span>
        </div>
      ))}
    </div>
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
  {timeSlots.map((time, timeSlotIndex) => (
    <tr key={time}>
      <td className="p-2 border-b border-gray-200 text-center">{time}</td>
      {days.map((day, dayIndex) => (
        <td key={day} className="p-2 border-b border-gray-200 text-center">
          <div className="inline-flex w-full h-4">
            {(() => {
              const selectedTAs = hoursData.filter(hoursObj => hoursObj &&   tas.some(ta => ta._id === hoursObj.userId) &&hoursObj.hours[dayIndex][timeSlotIndex] === 1);
              if (selectedTAs.length === 1) {
                const ta = selectedTAs[0];
                const colorClass = colorMapping[ta.userId];
                return <div className={`w-full h-full ${colorClass}`}></div>;
              } else if (selectedTAs.length > 1) {
                return selectedTAs.map((ta) => (
                  <div
                    key={ta.userId}
                    className={`flex-grow h-full ${colorMapping[ta.userId]}`}
                    style={{ width: `${100 / selectedTAs.length}%` }}
                  ></div>
                ));
              } else {
                return <div className="w-full h-full bg-gray-200"></div>;
              }
            })()}
          </div>
        </td>
      ))}
    </tr>
  ))}
</tbody>


      </table>
    </div>
    <div className="flex justify-center p-5 border-t border-gray-200">
      <button className="bg-red-400 hover:bg-red-500 text-white font-bold py-2 px-4 rounded m-2" onClick={onClose}>
        Close
      </button>
    </div>
  </div>
</div>


  );
};

export default TAHoursModal;
