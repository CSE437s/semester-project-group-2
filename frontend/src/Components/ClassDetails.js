import { useParams, useNavigate, Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import { useEffect, useState } from 'react';
import { findUser, getCurrentUser, logout } from '../UserUtils';
import { getClassByID } from '../ClassUtils';


const ClassDetails = () => {
    const { classId } = useParams();
    const [classDetails, setClassDetails] = useState(null);
    const [students, setStudents] = useState([]);
    const [teachingAssistants, setTeachingAssistants] = useState([]);
    const [taSchedules, setTASchedules] = useState([]);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [instructorName, setInstructorName] = useState("")
    const [instructorId, setInstructorId] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const token = localStorage.getItem("token")

    useEffect(() => {
        if(!token) {
            logout().then(status => {
                if(status === true) {
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
            if(user) {
                setUser(user)
            }
        }).catch(e => console.log(e))
        const fetchUsersDetails = async (userIds) => {
            const userDetails = await Promise.all(userIds.map(async (id) => {
                findUser(id).then(user => {
                    if(user) {
                        return {id: user._id, ...user}
                    }
                    return null
                }).catch(e => console.log(e))
            }))
            return userDetails.filter(Boolean)
        };

        // eslint-disable-next-line
        const fetchClassDetailsAndUsers = async () => {
            getClassByID(classId).then(classObject => {
                if(classObject) {
                    setClassDetails(classObject)
                }
                if(classObject.students) {
                    setStudents(classObject.students)
                }
                if(classObject.TAs) {
                    setTeachingAssistants(classObject.TAs)
                    // also get TA schedules
                }
                const instructorId = classObject.instructorId
                findUser(instructorId).then(instructor => {
                    if(instructor) {
                        setInstructorId(instructorId)
                        setInstructorName(instructor.firstName + " " + instructor.lastName)
                    }
                })
            })
            setIsLoading(false);
        }
        fetchClassDetailsAndUsers();
    }, [classId]);

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

    const promoteToTA = async (studentId) => {
        // if (instructorId && auth.currentUser.uid !== instructorId) {
        //     alert('Only instructors can promote students to TAs.');
        //     return;
        // }

        // const classRef = doc(db, 'classes', classId);
        // const classSnapshot = await getDoc(classRef);

        // if (classSnapshot.exists()) {
        //     const studentList = classSnapshot.data().students;
        //     const taList = classSnapshot.data().TAs;

        //     if (studentList.includes(studentId) && !taList.includes(studentId)) {
        //         // Promote the student to TA by removing them from the students list and adding them to the TAs list.
        //         await updateDoc(classRef, {
        //             students: arrayRemove(studentId),
        //             TAs: arrayUnion(studentId)
        //         });

        //         // Add the student to the TAs subcollection within the class document.
        //         const taRef = collection(classRef, 'TAs');
        //         await setDoc(doc(taRef, studentId), {
        //             // You can add any additional fields for the TA document here.
        //         });

        //         setStudents(studentList.filter(id => id !== studentId));
        //         setClassDetails({ ...classDetails, TAs: [...taList, studentId] });
        //         window.location.reload();
        //     }
        // }
    };




    const rerouteToClassroom = (e) => {
        const TAid = e.target.value;
        navigate(`/classrooms/${classId}/${TAid}`);
    };

    function formatTime24to12(time24) {
        const [hours24, minutes] = time24.split(':');
        const hours = parseInt(hours24, 10);
        const suffix = hours >= 12 ? 'PM' : 'AM';
        const hours12 = ((hours + 11) % 12 + 1);
        return `${hours12}:${minutes} ${suffix}`;
    }

    function getDayAbbreviation(day) {
        const dayAbbreviations = {
            'Sunday': 'Su',
            'Monday': 'M',
            'Tuesday': 'T',
            'Wednesday': 'W',
            'Thursday': 'Th',
            'Friday': 'F',
            'Saturday': 'S'
        };
        return dayAbbreviations[day] || '';
    }

    function isCurrentlyOH(ohTimes, currentTime) {
        const currentDayFullName = currentTime.toLocaleString('en-US', { weekday: 'long' });
        const currentDay = getDayAbbreviation(currentDayFullName); const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();

        console.log(`Current day: ${currentDay}`);
        console.log(`Current time: ${currentHour}:${currentMinute}`);
        console.log(`OH start time: ${ohTimes.start}`);
        console.log(`OH end time: ${ohTimes.end}`);

        const isInDay = ohTimes.days.includes(currentDay);
        const isAfterStart = currentHour > parseInt(ohTimes.start.split(':')[0], 10) ||
            (currentHour === parseInt(ohTimes.start.split(':')[0], 10) && currentMinute >= parseInt(ohTimes.start.split(':')[1], 10));
        const isBeforeEnd = currentHour < parseInt(ohTimes.end.split(':')[0], 10) ||
            (currentHour === parseInt(ohTimes.end.split(':')[0], 10) && currentMinute < parseInt(ohTimes.end.split(':')[1], 10));

        console.log(`Is in day: ${isInDay}`);
        console.log(`Is after start: ${isAfterStart}`);
        console.log(`Is before end: ${isBeforeEnd}`);

        return isInDay && isAfterStart && isBeforeEnd;
    }

    const currentTime = new Date();

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
        <div className="font-mono">
            <header className="bg-indigo-300 p-0 py-5">
                <div className="container flex justify-between items-center max-w-full">
                    <Link to="/home">
                        <div className="flex items-center">
                            <img src="/logo.png" alt="Logo" className="h-12 w-auto mr-2 pl-10" />
                            <h1 className="text-3xl font-bold text-black font-mono">ONLINE OFFICE HOURS</h1>
                        </div>
                    </Link>
                    <div>
                        <button
                            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 mr-2 rounded"
                            onClick={() => navigate("/dashboard")}
                        >
                            Back to Dashboard
                        </button>
                        <button
                            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 mr-2 rounded"
                            onClick={() => navigate("/me")}
                        >
                            My Profile
                        </button>

                        <LogoutButton />
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">

                {classDetails && (
                    <>
                        <div className="font-mono home-container">

                            {/* class name and prof */}
                            <div className="container mx-auto mt-6 bg-indigo-200 p-10 mb-6 rounded-lg shadow-lg">
                                <h1 className="text-3xl font-bold mb-4">{classDetails.className}</h1>
                                <p className="text-lg mb-4 text-gray-700">{classDetails.classDescription}</p>
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
                                        const taSchedule = taSchedules.find(schedule => schedule.taId === ta.id);
                                        const isOHNow = taSchedule && isCurrentlyOH(taSchedule.ohTimes, currentTime);
                                        return (
                                            <div key={ta.id} className="p-6 bg-indigo-200 rounded-lg shadow-xl flex flex-col justify-center items-center">
                                                <h3 className="text-xl font-bold mb-4">{ta.firstName} {ta.lastName}</h3>
                                                {taSchedule && (
                                                    <div className="text-center mb-4">
                                                        <p className="font-semibold">Office Hours:</p>
                                                        {taSchedule.ohTimes.days.map((day, index) => (
                                                            <p key={index}>
                                                                {day}: {formatTime24to12(taSchedule.ohTimes.start)} - {formatTime24to12(taSchedule.ohTimes.end)}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                                <button
                                                    // Change the color if you don't like it...
                                                    className={`mt-auto ${isOHNow ? 'bg-green-500 hover:bg-green-700' : 'bg-indigo-500 hover:bg-indigo-700'} text-white font-bold py-2 px-4 rounded transition-colors duration-300 ease-in-out`}
                                                    value={ta.id}
                                                    onClick={rerouteToClassroom}
                                                >
                                                    {isOHNow ? 'Join Office Hours Now' : 'View Virtual Classroom'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>


                            {/* students */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold mb-4">Students</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {students.map((student) => (
                                        <div key={student.id} className="p-5 bg-indigo-200 rounded-lg shadow-lg flex flex-col justify-center items-center">
                                            <span className="text-center text-xl font-bold mb-4">{student.firstName} {student.lastName}</span>
                                            {user?._id === instructorId && (
                                                <button
                                                    className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                                                    onClick={() => promoteToTA(student.id)}
                                                >
                                                    Promote to TA
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>


                        </div>

                    </>
                )}
            </div>
        </div>
    );
};

export default ClassDetails;
