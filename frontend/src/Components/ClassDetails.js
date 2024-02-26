import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';

const ClassDetails = ({}) => {
    const { classId } = useParams();
    const [classDetails, setClassDetails] = useState(null);
    const [students, setStudents] = useState([]);
    const [teachingAssistants, setTeachingAssistants] = useState([]);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [instructorId, setInstructorId] = useState("");

    useEffect(() => {
        const fetchClassDetailsAndStudents = async () => {
          const classRef = doc(db, 'classes', classId);
          const classSnapshot = await getDoc(classRef);
    
          if (classSnapshot.exists()) {
            const classData = classSnapshot.data();
            setClassDetails(classData);
            setStudents(classData.students || []);
            setTeachingAssistants(classData.TAs || []);
    
            const instructorRef = doc(db, 'users', classData.instructor);
            const instructorSnapshot = await getDoc(instructorRef);
    
            if (instructorSnapshot.exists()) {
              setUser(instructorSnapshot.data());
            }
          }
        };
    
        fetchClassDetailsAndStudents();
      }, [classId]);

    const promoteToTA = async (studentId) => {
        if (instructorId && auth.currentUser.uid !== instructorId) {
            alert('Only instructors can promote students to TAs.');
            return;
        }

        const classRef = doc(db, 'classes', classId);
        const classSnapshot = await getDoc(classRef);

        if (classSnapshot.exists()) {
            const studentList = classSnapshot.data().students;
            const taList = classSnapshot.data().TAs;

            if (studentList.includes(studentId) && !taList.includes(studentId)) {
                await updateDoc(classRef, {
                    students: arrayRemove(studentId),
                    TAs: arrayUnion(studentId)
                });

                setStudents(studentList.filter(id => id !== studentId));
                setClassDetails({ ...classDetails, TAs: [...taList, studentId] });
                window.location.reload();
            }
        }
    };

    const rerouteToClassroom = (e) => {
        const TAid = e.target.value;
        navigate("/classrooms/" + TAid);
    };

    useEffect(() => {
        if (classDetails) {
          setInstructorId(classDetails.instructor);
        }
      }, [classDetails]);

      return (
        <div className="container mx-auto px-4 py-8">
          {classDetails && (
            <>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h1 className="text-3xl leading-6 font-bold text-gray-900">{classDetails.className}</h1>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">{classDetails.classDescription}</p>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Professor</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.email}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Students</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                          {students.map(studentId => (
                            <li key={studentId} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                              <div className="w-0 flex-1 flex items-center">
                                <span className="ml-2 flex-1 w-0 truncate">Student ID: {studentId}</span>
                              </div>
                              {auth.currentUser?.uid === instructorId && (
                                <div className="ml-4 flex-shrink-0">
                                  <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={() => promoteToTA(studentId)}
                                  >
                                    Promote to TA
                                  </button>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Teaching Assistants</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                          {teachingAssistants.map(taId => (
                            <li key={taId} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                              <div className="w-0 flex-1 flex items-center">
                                <span className="ml-2 flex-1 w-0 truncate">TA ID: {taId}</span>
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <button
                                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                  value={taId}
                                  onClick={rerouteToClassroom}
                                >
                                  View Classroom
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </>
          )}
        </div>
      );
    };
    
    export default ClassDetails;