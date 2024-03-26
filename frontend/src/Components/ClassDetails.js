import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";
import {
  changeRoleInClass,
  findUser,
  getCurrentUser,
  logout,
} from "../UserUtils";
import { getClassByID } from "../ClassUtils";
import SimpleModal from "./SimpleModal";
import ScheduleModal from "./ScheduleModal";
import { getUserHoursForClass } from "../UserUtils";

const ClassDetails = () => {
  const { classId } = useParams();
  const [classDetails, setClassDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachingAssistants, setTeachingAssistants] = useState([]);
  // eslint-disable-next-line
  const [taSchedules, setTASchedules] = useState([]);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [instructorName, setInstructorName] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTA, setIsTA] = useState(false);
  const token = localStorage.getItem("token");
  const [isInstructor, setIsInstructor] = useState(false);
  useEffect(() => {
    setIsInstructor(user?.role === "instructor");
  }, [user]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const [searchTerm, setSearchTerm] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const toggleScheduleModal = () => {
    console.log("Toggling Schedule Modal");
    setShowScheduleModal(!showScheduleModal);
  };

  const filteredTeachingAssistants = teachingAssistants.filter(
    (ta) =>
      ta.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ta.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ta.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = students.filter(
    (student) =>
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    if (!token) {
      logout()
        .then((status) => {
          if (status === true) {
            navigate("/login");
          } else {
            console.log("ruh roh");
            return;
          }
        })
        .catch((e) => {
          navigate("/home");
        });
    }
    getCurrentUser()
      .then((user) => {
        if (user) {
          setUser(user.data.user);
          console.log("Set user:", user.data.user);
        }
      })
      .catch((e) => console.log(e));
    //eslint-disable-next-line
    const fetchUsersDetails = async (userIds) => {
      const userDetails = await Promise.all(
        userIds.map(async (id) => {
          findUser(id)
            .then((user) => {
              if (user) {
                return { id: user._id, ...user };
              }
              return null;
            })
            .catch((e) => console.log(e));
        })
      );
      return userDetails.filter(Boolean);
    };

    function getHoursByUserAndClass(userId, classId) {
          return getUserHoursForClass(userId, classId).then(result => result)
          // .then(hours => {
          //   if(hours === null) {
          //     console.log("An error occured")
          //   }
          //   return hours
          // })
      // return axios
      //   .get(url + "/api/hours", { params: { userId, classId } },
      //   {
      //       headers: {
      //           "ngrok-skip-browser-warning": true
      //       }
      //   })
      //   .then((response) => {
      //     console.log(
      //       `Hours data for user ${userId} and class ${classId}:`,
      //       response.data.hours
      //     );
      //     return response.data.hours; // Assuming the response has the hours data
      //   })
      //   .catch((error) => {
      //     console.error("Error fetching hours for user and class: ", error);
      //     // Handle error appropriately
      //     return null; // Indicate an error by returning null or an appropriate error value
      //   });
    }
    // eslint-disable-next-line
    const fetchClassDetailsAndUsers = () => {
      getClassByID(classId).then((classObject) => {
        if (classObject) {
          setClassDetails(classObject);
        }
        if (classObject.students) {
          setStudents(classObject.students);
        }
        if (classObject.TAs) {
          setTeachingAssistants(classObject.TAs);
          // also get TA schedules
        }
        const instructorId = classObject.instructorId;
        findUser(instructorId)
          .then((instructor) => {
            if (instructor) {
              setInstructorId(instructorId);
              setInstructorName(
                instructor.firstName + " " + instructor.lastName
              );
            }

            if (classObject.TAs) {
              setTeachingAssistants(classObject.TAs);
              // Fetch TA schedules using TA IDs and class ID
              const taSchedulesPromises = classObject.TAs.map((ta) =>
                getHoursByUserAndClass(ta._id, classObject._id)
              );
              Promise.all(taSchedulesPromises)
                .then((taSchedules) => {
                  setTASchedules(taSchedules);
                  console.log("set ta schedules to ", taSchedules)
                  // After setting TA schedules, fetch instructor details
                  if (classObject.instructorId) {
                    findUser(classObject.instructorId)
                      .then((instructor) => {
                        if (instructor) {
                          setInstructorId(instructor._id);
                          setInstructorName(
                            instructor.firstName + " " + instructor.lastName
                          );
                          setIsLoading(false); // Set loading to false after all async operations are complete
                        }
                      })
                      .catch((error) => {
                        console.error(
                          "Error fetching instructor details: ",
                          error
                        );
                        setIsLoading(false);
                      });
                  }
                })
                .catch((error) => {
                  console.error("Error fetching TA schedules: ", error);
                  setIsLoading(false);
                });
            } else {
              setIsLoading(false);
            }
          })
          .catch((error) => {
            console.error("Error fetching class details: ", error);
            setIsLoading(false);
          });
      });
    };
    fetchClassDetailsAndUsers();
  }, [classId, navigate, token]);

  useEffect(() => {
    if (user && classDetails) {
      const isUserTA = classDetails.TAs.some((ta) => ta._id === user._id);
      setIsTA(isUserTA);
      console.log("TAsate" + isUserTA);
    }
  }, [user, classDetails]);

  //eslint-disable-next-line
  const fetchTASchedules = async (taIds) => {
    // try {
    //     const schedules = await Promise.all(taIds.map(async (TAid) => {
    //         const taRef = doc(db, "classes", classId, "TAs", TAid);
    //         const taDoc = await getDoc(taRef);
    //         if (taDoc.exists()) {
    //             const taData = taDoc.data();
    //             if (taData.OHtimes) {
    //                 return { taId: TAid, ohTimes: taData.OHtimes };
    //             } else {
    //                 console.log(`TA with ID ${TAid} has no office hours data.`);
    //                 return null;
    //             }
    //         } else {
    //             console.log(`TA document with ID ${TAid} does not exist.`);
    //             return null;
    //         }
    //     }));
    //     setTASchedules(schedules.filter(Boolean));
    // } catch (error) {
    //     console.error("Error fetching TA schedules:", error);
    // }
  };

  const demoteToStudent = async (taId) => {
    if (instructorId && user._id !== instructorId) {
      alert("Only instructors can demote TAs to students.");
      return;
    }
    setIsLoading(true);
    changeRoleInClass(taId, classId, "TA", "student")
      .then((res) => {
        if (res === true) {
          setTeachingAssistants((prevTAs) =>
            prevTAs.filter((ta) => ta._id !== taId)
          );
          setStudents((prevStudents) => [
            ...prevStudents,
            teachingAssistants.find((ta) => ta._id === taId),
          ]);

          alert("TA successfully demoted to student.");
        } else {
          alert("There was an error demoting the TA.");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const promoteToTA = async (studentId) => {
    console.log(user._id === instructorId, instructorId, user._id);
    if (instructorId && user._id !== instructorId) {
      alert("Only instructors can promote students to TAs.");
      return;
    }
    setIsLoading(true);

    changeRoleInClass(studentId, classId, "student", "TA")
      .then((res) => {
        if (res === true) {
          setStudents((prevStudents) =>
            prevStudents.filter((student) => student._id !== studentId)
          );
          setTeachingAssistants((prevTAs) => [
            ...prevTAs,
            students.find((student) => student._id === studentId),
          ]);
          alert("success");
          window.location.reload();
        } else {
          alert("error");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const rerouteToClassroom = (e) => {
    const TAid = e.target.value;
    navigate(`/classrooms/${TAid}`);
  };

  function isCurrentlyOH(hoursArray, currentTime) {
    const currentDayIndex = currentTime.getDay() - 1;
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeSlotIndex =
      (currentHour - 8) * 2 + (currentMinute >= 30 ? 1 : 0);

    return hoursArray[currentDayIndex][currentTimeSlotIndex] === 1;
  }

  const currentTime = new Date();

  function formatSchedule(hoursArray) {
    const days = ["M", "T", "W", "Th", "F", "S", "Su"];
    const timeSlots = [];
    for (let hour = 8; hour < 22; hour++) {
      timeSlots.push(formatTime(hour, "00"));
      timeSlots.push(formatTime(hour, "30"));
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
          hours: daySchedule.join(", "),
        });
      }
    });

    return formattedSchedule;
  }

  const handleScheduleSubmit = (classId, userId, newHours) => {
    window.location.reload();
  };

  function formatTime(hour, minutes) {
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour}:${minutes} ${ampm}`;
  }

  function getNextTimeSlot(time) {
    const [hourStr, minuteStr, ampm] = time.split(/[: ]/);
    let hour = parseInt(hourStr);
    let minute = parseInt(minuteStr);

    if (minute === 30) {
      minute = "00";
      hour += 1;
    } else {
      minute = "30";
    }

    if (hour === 12 && minute === "00") {
      return `12:30 ${ampm}`;
    }

    if (hour === 12 && minute === "30") {
      return `1:00 ${ampm === "AM" ? "PM" : "AM"}`;
    }

    return `${hour}:${minute} ${ampm}`;
  }

  // Example usage
  const taSchedule = [
    [
      0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0,
    ],
    // ... and so on for each day
  ];

  console.log(formatSchedule(taSchedule));

  useEffect(() => {
    if (classDetails) {
      setInstructorId(classDetails.instructor);
    }
  }, [classDetails]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex justify-center items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 0116 0H4z"
            ></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="font-mono">
      <header className="bg-indigo-300 p-0 py-5 z-10">
        <div className="container flex justify-between items-center max-w-full">
          <Link to="/home">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-12 w-auto mr-2 pl-10"
              />
              <h1 className="text-3xl font-bold text-black font-mono">
                ONLINE OH
              </h1>
            </div>
          </Link>

          {/* hamburgie menu */}
          <div className="lg:hidden font-mono">
            <div
              className="HAMBURGER-ICON space-y-2 mr-10"
              onClick={() => setIsNavOpen((prev) => !prev)}
            >
              <span className="block h-0.5 w-8 animate-pulse bg-black"></span>
              <span className="block h-0.5 w-8 animate-pulse bg-black"></span>
              <span className="block h-0.5 w-8 animate-pulse bg-black"></span>
            </div>

            {isNavOpen && (
              <div className="MOBILE-MENU absolute top-0 right-0 px-8 py-8 bg-white font-mono">
                <div className="CROSS-ICON" onClick={() => setIsNavOpen(false)}>
                  <svg
                    className="h-8 w-8 text-gray-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <ul className="flex flex-col items-center justify-between min-h-[250px]">
                  <li className="border-b border-gray-400 my-8 uppercase">
                    <a href="/dashboard">Dashboard</a>
                  </li>
                  <li className="border-b border-gray-400 my-8 uppercase">
                    <a href="/me">My Profile</a>
                  </li>
                  {isTA && (
                    <li className="border-b border-gray-400 my-8 uppercase">
                      <a href={`/classrooms/${user._id}`}>My Classroom</a>
                    </li>
                  )}

                  {isInstructor ? (
                    <li className="border-b border-gray-400 my-8 uppercase">
                      <button
                        onClick={() => {
                          toggleModal();
                          setIsNavOpen(false);
                        }}
                      >
                        Manage Students
                      </button>
                    </li>
                  ) : (
                    <li className="border-b border-gray-400 my-8 uppercase">
                      <button
                        onClick={() => {
                          toggleModal();
                          setIsNavOpen(false);
                        }}
                      >
                        View Classmates
                      </button>
                    </li>
                  )}
                  <li className="border-b border-gray-400 my-8 uppercase">
                    <LogoutButton />
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* normal menu */}

          <nav className="hidden lg:flex mr-10">
            <button
              className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 mr-2 rounded"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>

            {isInstructor === true ? (
              <button
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 mr-2 rounded"
                onClick={toggleModal}
              >
                Manage Students
              </button>
            ) : (
              <button
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 mr-2 rounded"
                onClick={toggleModal}
              >
                View Classmates
              </button>
            )}

            {isTA === true || isInstructor === true ? 
                            <button
                                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 mr-2 rounded"
                                onClick={()=>navigate("classrooms/" + user._id)}
                            >
                                My Classroom
                            </button>
            : <></>}

            <button
              className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 mr-2 rounded"
              onClick={() => navigate("/me")}
            >
              My Profile
            </button>

            <LogoutButton />
          </nav>
          {showScheduleModal && (
            <ScheduleModal
              onClose={toggleScheduleModal}
              userId={user._id}
              className={classDetails.className}
              classId={classId}
              onScheduleSubmit={handleScheduleSubmit}
            />
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {classDetails && (
          <>
            <div className="font-mono home-container">
              {/* class name and prof */}
              <div className="container mx-auto mt-6 bg-indigo-200 p-10 mb-6 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold mb-4">
                  {classDetails.className}
                </h1>
                <p className="text-lg mb-4 text-gray-700">
                  {classDetails.classDescription}
                </p>
                <div className="border-t border-gray-300 pt-4">
                  <p className="text-black font-semibold">Professor:</p>
                  <p className="text-gray-700">{instructorName}</p>
                </div>
              </div>

              {/* TAs */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-6">Teaching Assistants</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {teachingAssistants.map((ta) => {
                    if (!ta) {
                      return (
                        <div
                          key={ta._id}
                          className="p-6 bg-red-200 rounded-lg shadow-xl flex flex-col justify-center items-center"
                        >
                          <h3 className="text-xl font-bold mb-4">
                            Error: TA not found
                          </h3>
                        </div>
                      );
                    }

                    const taSchedule = taSchedules?.find(
                      (schedule) => schedule?.userId === ta._id
                    );
                    const isOHNow =
                      taSchedule &&
                      isCurrentlyOH(taSchedule.hours, currentTime);

                    return (
                      <div
                        key={ta._id}
                        className="p-6 bg-indigo-200 rounded-lg shadow-xl flex flex-col justify-center items-center"
                      >
                        <h3 className="text-xl font-bold mb-4">
                          {" "}
                          <Link to={`/users/${ta._id}`} className="text-xl font-bold mb-4">
                              
                          {user._id === ta._id
                            ? "You!"
                            : ta.firstName + " " + ta.lastName}
                            </Link>
                        </h3>
                        {taSchedule && taSchedule.hours ? (
                          <div className="text-center mb-4">
                            <p className="font-semibold">Office Hours:</p>
                            <div className="space-y-1">
                              {formatSchedule(taSchedule.hours).map(
                                (scheduleEntry, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-2"
                                  >
                                    <span
                                      className="font-semibold"
                                      style={{
                                        minWidth: "2rem",
                                        textAlign: "right",
                                      }}
                                    >
                                      {scheduleEntry.day}:
                                    </span>
                                    <span style={{ textAlign: "left" }}>
                                      {scheduleEntry.hours}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center mb-4">
                            <p className="font-semibold">Office Hours:</p>
                            <p>No office hours scheduled.</p>
                          </div>
                        )}
                        {user._id === ta._id ? (
                          <button
                            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 ease-in-out"
                            onClick={() => {
                              toggleScheduleModal();
                              setIsNavOpen(false);
                            }}
                          >
                            Change Office Hours
                          </button>
                        ) : (
                          <button
                            className={`mt-auto ${
                              isOHNow
                                ? "bg-green-500 hover:bg-green-700"
                                : "bg-indigo-500 hover:bg-indigo-700"
                            } text-white font-bold py-2 px-4 rounded transition-colors duration-300 ease-in-out`}
                            value={ta._id}
                            onClick={rerouteToClassroom}
                          >
                            {isOHNow
                              ? "Join Office Hours Now"
                              : "View Virtual Classroom"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <SimpleModal isOpen={isModalOpen} close={toggleModal}>
                <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
                  <input
                    type="text"
                    placeholder="Search by name or email"
                    className="mt-4 mb-6 px-4 py-2 border rounded w-full"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  <h2 className="text-2xl font-bold text-indigo-600">
                    Teaching Assistants
                  </h2>
                  <ul className="space-y-3">
                    {filteredTeachingAssistants.map((ta) => (
                      <li
                        key={ta._id}
                        className="flex items-center justify-between space-x-3"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {ta.firstName} {ta.lastName}
                          </div>
                          <div className="text-gray-500">{ta.email}</div>
                        </div>
                        {isInstructor && (
                          <button
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded whitespace-nowrap"
                            onClick={() => demoteToStudent(ta._id)}
                          >
                            Demote to Student
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>

                  <h2 className="text-2xl font-bold text-indigo-600">
                    Students
                  </h2>
                  <ul className="space-y-3">
                    {filteredStudents.map((student) => (
                      <li
                        key={student._id}
                        className="flex items-center justify-between space-x-3"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-gray-500">{student.email}</div>
                        </div>
                        {isInstructor && (
                          <button
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-700 text-white font-bold rounded whitespace-nowrap"
                            onClick={() => promoteToTA(student._id)}
                          >
                            Promote to TA
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-center">
                    <button
                      className="mt-4 px-6 py-2 bg-indigo-500 hover:bg-indigo-700 text-white font-bold rounded"
                      onClick={toggleModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </SimpleModal>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClassDetails;
