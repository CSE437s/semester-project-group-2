import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  changeRoleInClass, findUser, getCurrentUser, logout, getUserHoursForClass, DropStudentFromClass,
  DeleteClass, deleteUserHours
} from '../UserUtils';
import { isCurrentlyOH, formatSchedule } from '../scheduleUtils';
import { getClassByID } from '../ClassUtils';
import SimpleModal from './SimpleModal';
import ScheduleModal from './ScheduleModal';
import TAHoursModal from './TAHoursModal';
import Header from './Header';

const ClassDetails = () => {
  const { classId } = useParams();
  const [classDetails, setClassDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachingAssistants, setTeachingAssistants] = useState([]);
  // eslint-disable-next-line
  const [taSchedules, setTASchedules] = useState([]);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [instructorName, setInstructorName] = useState("")
  const [instructorId, setInstructorId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTA, setIsTA] = useState(false);
  const token = localStorage.getItem("token")
  const [isInstructor, setIsInstructor] = useState(false);
  useEffect(() => {
    setIsInstructor(user?.role === 'instructor');
  }, [user]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isTAHoursModalOpen, setIsTAHoursModalOpen] = useState(false);

  const toggleTAHoursModal = () => {
    setIsTAHoursModalOpen(!isTAHoursModalOpen);
  };

  const toggleScheduleModal = () => {
    console.log('Toggling Schedule Modal');
    setShowScheduleModal(!showScheduleModal);
  };

  const filteredTeachingAssistants = teachingAssistants.filter(ta =>
    ta.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ta.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ta.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );


  useEffect(() => {
    if (!token) {
      logout().then(status => {
        if (status === true) {
          navigate("/login")
        }
        else {
          console.log("ruh roh")
          return
        }
      }).catch(e => {
        navigate("/home")
      })
    }
    getCurrentUser().then(user => {
      console.log('Fetched user:', user);
      if (user) {
        setUser(user.data.user);
        console.log('Set user:', user.data.user);
      }
    }).catch(e => console.log(e));
    //eslint-disable-next-line
    const fetchUsersDetails = async (userIds) => {
      const userDetails = await Promise.all(userIds.map(async (id) => {
        findUser(id).then(user => {
          if (user) {
            return { id: user._id, ...user }
          }
          return null
        }).catch(e => console.log(e))
      }))
      return userDetails.filter(Boolean)
    };

    function getHoursByUserAndClass(userId, classId) {

      return getUserHoursForClass(userId, classId);
    }
    // eslint-disable-next-line
    const fetchClassDetailsAndUsers = () => {
      getClassByID(classId).then(classObject => {
        if (classObject) {
          setClassDetails(classObject);

          if (classObject.students) {
            setStudents(classObject.students);
          }

          if (classObject.TAs) {
            setTeachingAssistants(classObject.TAs);
            const taSchedulesPromises = classObject.TAs.map(ta =>
              getHoursByUserAndClass(ta._id, classObject._id));
            console.log("taSchedulesPromises")
            console.log(taSchedulesPromises)
            Promise.all(taSchedulesPromises).then(taSchedules => {
              console.log("This is schedules")
              console.log(taSchedules)
              setTASchedules(taSchedules);
              console.log("taSchedul update ")
              if (classObject.instructorId) {
                findUser(classObject.instructorId).then(instructor => {
                  if (instructor) {
                    setInstructorId(instructor._id);
                    setInstructorName(instructor.firstName + " " + instructor.lastName);
                    setIsLoading(false); // Set loading to false after all async operations are complete
                  }
                }).catch(error => {
                  console.error("Error fetching instructor details: ", error);
                  setIsLoading(false);
                });
              }
            }).catch(error => {
              console.error("Error fetching TA schedules: ", error);
              setIsLoading(false);
            });
          } else {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      }).catch(error => {
        console.error("Error fetching class details: ", error);
        setIsLoading(false);
      });
    };

    fetchClassDetailsAndUsers();
  }, [classId, navigate, token]);
  console.log(teachingAssistants)

  useEffect(() => {
    if (user && classDetails) {
      const isUserTA = classDetails.TAs.some(ta => ta._id === user._id);
      setIsTA(isUserTA);
      console.log("TAsate" + isUserTA);
    }
  }, [user, classDetails]);

  const dropClass = async () => {
    const confirmDrop = window.confirm("Are you sure you want to drop this class?");
    if (confirmDrop) {
      const userId = user._id;
      DropStudentFromClass(userId, classId, isTA)
        .then((res) => {
          //alert("Successfully dropped class!");
          navigate("/dashboard");

        });
    }
  };


  const deleteClass = async () => {
    const confirmDrop = window.confirm("Are you sure you want to delete this class?");
    if (confirmDrop) {
      //const userId = user.id;
      DeleteClass(classId)
        .then((res) => {
          alert("Successfully deleted class!");
          navigate("/dashboard");

        });
    }
  };

  const demoteToStudent = async (taId) => {
    if (instructorId && user._id !== instructorId) {
      alert('Only instructors can demote TAs to students.');
      return;
    }
    if (!window.confirm('Are you sure you want to demote this TA to a student? This will delete their office hours.')) {
      return;
    }
    setIsLoading(true);
    changeRoleInClass(taId, classId, "TA", "student").then(res => {
      if (res === true) {
        setTeachingAssistants(prevTAs => prevTAs.filter(ta => ta._id !== taId));
        setStudents(prevStudents => [...prevStudents, teachingAssistants.find(ta => ta._id === taId)]);
        deleteUserHours(taId, classId).then(hourRes => {
          if (hourRes) {
            alert('TA successfully demoted to student.');
          } else {
            alert('TA demoted, but failed to delete hours.');
          }
        });
      } else {
        alert("There was an error demoting the TA.");
      }
    }).finally(() => {
      window.location.reload();
      setIsLoading(false);
    });
  };

  const promoteToTA = async (studentId) => {
    console.log(user._id === instructorId, instructorId, user._id)
    if (instructorId && user._id !== instructorId) {
      alert('Only instructors can promote students to TAs.');
      return;
    }
    if (!window.confirm('Are you sure you want to promote this student to a TA?')) {
      return;
    }

    setIsLoading(true);

    changeRoleInClass(studentId, classId, "student", "TA").then(res => {
      if (res === true) {
        setStudents(prevStudents => prevStudents.filter(student => student._id !== studentId));
        setTeachingAssistants(prevTAs => [...prevTAs, students.find(student => student._id === studentId)]);

        alert("success")
        // window.location.reload()
      }
      else {
        alert("error")
      }
    }).finally(() => {
      setIsLoading(false);
    });
  };




  const rerouteToClassroom = (e) => {
    const TAid = e.target.value;
    navigate(`/classrooms/waiting/${TAid}`);
  };



  const handleScheduleSubmit = (classId, userId, newHours) => {
    window.location.reload();
  }

  useEffect(() => {
    if (classDetails) {
      setInstructorId(classDetails.instructor);
    }
  }, [classDetails]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex justify-center items-center">
          <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0116 0H4z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="font-mono bg-indigo-50 h-dvh text-gray-800">
      <Header />

      <div className="container mx-auto sm:px-4 p-0 pt-4 ">

        {classDetails && (
          <>
            <div className="font-mono home-container">

              {/* class name and prof */}
              <div className="container mx-auto mt-6 bg-indigo-300 sm:p-10 p-5 mb-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold">{classDetails.className}</h1>
                  {isInstructor ? (
                    <div className="flex space-x-4"> {/* Wrap buttons in a flex container */}
                      <button
                        className="border border-indigo-500 border-solid relative hover:bg-indigo-500 text-black font-bold py-2 px-4 rounded transition duration-300 flex items-center"
                        onClick={toggleModal}
                      >
                        Manage Students
                      </button>
                      <button
                        className="relative bg-red-400 hover:bg-red-500 text-black font-bold py-2 px-4 mr-2 !ml-2 rounded"
                        onClick={() => {
                          deleteClass()
                        }}
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-4"> {/* Wrap buttons in a flex container */}
                      <button
                        className="border border-indigo-500 border-solid relative hover:bg-indigo-500 text-black font-bold py-2 px-4 rounded transition duration-300 flex items-center"
                        onClick={toggleModal}
                      >

                        Classmates
                      </button>
                      <button
                        className="relative bg-red-400 hover:bg-red-500 font-bold py-2 px-4 mr-2 rounded !ml-2 "
                        onClick={() => {
                          dropClass()
                        }}
                      >
                        X
                      </button>
                    </div>
                  )}
                </div>



                <p className="text-lg mb-4 text-gray-700 mt-4">{classDetails.classDescription}</p>
                <div className="">
                  <p className="text-black font-semibold">Professor:</p>
                  <p className="text-gray-700 mb-6">{instructorName}</p>

                </div>




              </div>


              {/* TAs */}
              <div className="bg-indigo-300 rounded-lg shadow-xl mb-8 p-10">
                <div className="flex flex-row mb-4 justify-between flex-wrap">
                  <h2 className="sm:text-3xl text-2xl font-bold mb-2">Teaching Assistants</h2>
                  <div className='flex flex-row w-max'>
                    <button
                      className="mr-2 border border-indigo-500 border-solid relative hover:bg-indigo-500 text-black font-bold py-2 px-4 rounded"
                      onClick={toggleTAHoursModal}
                    >
                      TA Hours
                    </button>

                    {isTA && (
                      <button
                        className="border border-indigo-500 border-solid relative hover:bg-indigo-500 text-black font-bold py-2 px-4 rounded transition duration-300 flex items-center"
                        onClick={toggleScheduleModal}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 011 1v1h6V3a1 1 0 112 0v1h1a2 2 0 012 2v11a2 2 0 01-2 2h-1v1a1 1 0 11-2 0v-1H7v1a1 1 0 11-2 0v-1H4a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zM4 6v11h12V6H4z" clipRule="evenodd" />
                          <path d="M8 11a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        </svg>
                        Set My Schedule
                      </button>
                    )}{showScheduleModal && (
                      <ScheduleModal
                        onClose={toggleScheduleModal}
                        userId={user._id}
                        className={classDetails.className}
                        classId={classId}
                        onScheduleSubmit={handleScheduleSubmit}
                      />
                    )}
                  </div>

                </div>

                {isTAHoursModalOpen && (
                  <TAHoursModal
                    onClose={toggleTAHoursModal}
                    hoursData={taSchedules}
                    tas={teachingAssistants}
                  />
                )}

                {isTAHoursModalOpen && (
                  <TAHoursModal
                    onClose={toggleTAHoursModal}
                    hoursData={taSchedules}
                    tas={teachingAssistants}
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {teachingAssistants
                    .map(ta => {
                      const taSchedule = taSchedules?.find(schedule => schedule?.userId === ta._id);
                      const isOHNow = taSchedule && isCurrentlyOH(taSchedule.hours, new Date());
                      let formattedSchedule = [];
                      if (taSchedule && taSchedule.hours) {
                        formattedSchedule = formatSchedule(taSchedule.hours);
                      }
                      const hasScheduledHours = formattedSchedule && formattedSchedule.some(schedule => schedule.hours.length > 0);
                      return { ...ta, isOHNow, taSchedule, formattedSchedule, hasScheduledHours };
                    })
                    .sort((a, b) => b.isOHNow - a.isOHNow)
                    .map(({ _id, firstName, lastName, isOHNow, formattedSchedule, hasScheduledHours }) => (
                      <div key={_id} className="hover:bg-indigo-100 p-6 bg-indigo-50 rounded-lg shadow-xl flex flex-col justify-center items-center">
                        <div className="text-center">
                          <div className="overflow-x-scroll" style={{ width: '10rem' }}>
                            <h3 className="text-xl font-bold mb-4">{user?._id === _id ? <Link to={`/me`}>{"You!"}</Link> : <Link to={`/users/${_id}`}>{firstName} {lastName}</Link>}</h3>
                          </div>
                        </div>
                        {hasScheduledHours ? (
                          <div className="text-center mb-4">
                            <p className="font-semibold">Office Hours:</p>
                            <div className="space-y-1">
                              {formattedSchedule.map((scheduleEntry, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <span className="font-semibold" style={{ minWidth: '2rem', textAlign: 'right' }}>{scheduleEntry.day}:</span>
                                  <span style={{ textAlign: 'left' }}>{scheduleEntry.hours}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center mb-4">
                            <p className="font-semibold">Office Hours:</p>
                            <p>No office hours scheduled.</p>
                          </div>
                        )}
                        {isOHNow && (
                          <button
                            className="mt-auto bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 ease-in-out"
                            value={_id}
                            onClick={rerouteToClassroom}
                          >
                            {user?._id === _id ? "Your Classroom" : 'Join Office Hours'}
                          </button>
                        )}
                      </div>

                    ))}
                </div>


              </div>

              <SimpleModal isOpen={isModalOpen} close={toggleModal}>
                <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
                  <input
                    type="text"
                    placeholder="Search by name or email"
                    className="mt-4 mb-6 px-4 py-2 border rounded w-full"
                    onChange={e => setSearchTerm(e.target.value)}
                  />

                  <h2 className="text-2xl font-bold text-indigo-600">Teaching Assistants</h2>

                  <ul className="space-y-3">
                    {filteredTeachingAssistants.map((ta) => (
                      <li key={ta._id} className="flex items-center justify-between space-x-3">
                        <div className="flex-1">
                          {/* <div className="font-medium text-gray-900">{ta.firstName} {ta.lastName}</div> */}
                          {/* <Link to={`/users/${ta._id}`} className="text-xl font-bold mb-4">
                                                        {ta.firstName} {ta.lastName}
                          </Link> */}
                          <h3 className="text-xl font-bold mb-1">{user?._id === ta._id ? <Link to={`/me`} className="text-xl font-bold mb-4">
                            {ta.firstName} {ta.lastName} </Link> : <Link to={`/users/${ta._id}`} className="text-xl font-bold mb-4">
                            {ta.firstName} {ta.lastName}
                          </Link>}</h3>
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

                  <h2 className="text-2xl font-bold text-indigo-600">Students</h2>
                  <ul className="space-y-3">
                    {filteredStudents.map((student) => (
                      <li key={student._id} className="flex items-center justify-between space-x-3">
                        <div className="flex-1">
                          {/* <div className="font-medium text-gray-900">{student.firstName} {student.lastName}</div> */}
                          {/* <Link to={`/users/${student._id}`} className="text-xl font-bold mb-4">
                                                        {student.firstName} {student.lastName}
                          </Link> */}
                          <h3 className="text-xl font-bold mb-1">{user?._id === student._id ? <Link to={`/me`} className="text-xl font-bold mb-4">
                            {student.firstName} {student.lastName} </Link> : <Link to={`/users/${student._id}`} className="text-xl font-bold mb-4">
                            {student.firstName} {student.lastName}
                          </Link>}</h3>

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
    </div >
  );
};

export default ClassDetails;
