import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';

const ClassDetails = ({ }) => {
    const { classId } = useParams();
    const [classDetails, setClassDetails] = useState(null);
    const [students, setStudents] = useState([]);
    const [teachingAssistants, setTeachingAssistants] = useState([]);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [instructorId, setInstructorId] = useState("");

    useEffect(() => {
        const fetchUsersDetails = async (userIds) => {
            const userDetails = await Promise.all(userIds.map(async (userId) => {
                const userRef = doc(db, 'users', userId);
                const userSnap = await getDoc(userRef);
                return userSnap.exists() ? { id: userId, ...userSnap.data() } : null;
            }));
            return userDetails.filter(Boolean);
        };

        const fetchClassDetailsAndUsers = async () => {
            const classRef = doc(db, 'classes', classId);
            const classSnapshot = await getDoc(classRef);

            if (classSnapshot.exists()) {
                const classData = classSnapshot.data();
                setClassDetails(classData);

                if (classData.students) {
                    const studentDetails = await fetchUsersDetails(classData.students);
                    setStudents(studentDetails);
                }
                if (classData.TAs) {
                    const taDetails = await fetchUsersDetails(classData.TAs);
                    setTeachingAssistants(taDetails);
                }

                const instructorRef = doc(db, 'users', classData.instructor);
                const instructorSnapshot = await getDoc(instructorRef);

                if (instructorSnapshot.exists()) {
                    setUser(instructorSnapshot.data());
                    setInstructorId(classData.instructor);
                }
            }
        };

        fetchClassDetailsAndUsers();
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
                                <div className="mt-8">
                                    <h2 className="text-xl font-bold mb-2">Students</h2>
                                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                                        {students.map((student) => (
                                            <li key={student.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                                <span className="flex-1 w-0 truncate">{student.firstName} {student.lastName}</span>
                                                {auth.currentUser?.uid === instructorId && (
                                                    <button
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                                        onClick={() => promoteToTA(student.id)}
                                                    >
                                                        Promote to TA
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-8">
                                    <h2 className="text-xl font-bold mb-2">Teaching Assistants</h2>
                                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                                        {teachingAssistants.map((ta) => (
                                            <li key={ta.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                                <span className="ml-2 flex-1 w-0 truncate">{ta.firstName} {ta.lastName}</span>
                                                <button
                                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                                    value={ta.id}
                                                    onClick={rerouteToClassroom}
                                                >
                                                    View Classroom
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
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