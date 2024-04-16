
export function isCurrentlyOH(hoursArray, currentTime) {
    const currentDayIndex = currentTime.getDay() - 1;
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeSlotIndex = (currentHour - 8) * 2 + (currentMinute >= 30 ? 1 : 0);

    return hoursArray[currentDayIndex][currentTimeSlotIndex] === 1;
  }

  export function formatSchedule(hoursArray) {
    const days = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];
    const timeSlots = [];
    for (let hour = 8; hour < 22; hour++) {
      timeSlots.push(formatTime(hour, '00'));
      timeSlots.push(formatTime(hour, '30'));
    }

    const formattedSchedule = [];

    hoursArray.forEach((daySlots, dayIndex) => {
      let daySchedule = [];
      let startTime = null;
      let endTime = null;

      daySlots.forEach((slot, slotIndex) => {
        if (slot === 1) {
          if (startTime === null) {
            startTime = timeSlots[slotIndex];
          }
          endTime = getNextTimeSlot(timeSlots[slotIndex]);
        } else {
          if (startTime !== null) {
            daySchedule.push(`${startTime}-${endTime}`);
            startTime = null;
            endTime = null;
          }
        }
      });

      if (startTime !== null) {
        daySchedule.push(`${startTime}-${endTime}`);
      }

      if (daySchedule.length > 0) {
        formattedSchedule.push({
          day: days[dayIndex],
          hours: daySchedule.join(', ')
        });
      }
    });

    return formattedSchedule;
  }

  export function formatTime(hour, minutes) {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour}:${minutes} ${ampm}`;
  }

  export function getNextTimeSlot(time) {
    const [hourStr, minuteStr, ampm] = time.split(/[: ]/);
    let hour = parseInt(hourStr);
    let minute = parseInt(minuteStr);

    if (minute === 30) {
      minute = '00';
      hour += 1;
    } else {
      minute = '30';
    }

    if (hour === 12 && minute === '00') {
      return `12:30 ${ampm}`;
    }

    if (hour === 12 && minute === '30') {
      return `1:00 ${ampm === 'AM' ? 'PM' : 'AM'}`;
    }

    return `${hour}:${minute} ${ampm}`;
  }