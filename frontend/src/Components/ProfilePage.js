import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { findUser } from '../UserUtils';
import Header from './Header';

const ProfilePage = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [backgroundColor, setBackgroundColor] = useState("white"); 

    useEffect(() => {

        findUser(userId)
            .then((userData) => {
                setUser(userData);
                setBackgroundColor(userData.bg_color || "white"); 
            })
            .catch((error) => {
                console.error('Error fetching user details:', error);
            });
    }, [userId]);

    return (
        <div className="font-mono min-h-screen" style={{ backgroundColor: backgroundColor }}>
            <Header />
            <div className="container mx-auto px-4 py-8">
                {user && (
                    <div className="bg-indigo-200 font-mono container mx-auto mt-6 p-10 rounded-lg shadow-lg">
                        <h1 className="text-3xl font-bold text-center mb-4">{user.firstName} {user.lastName}</h1>
                        <div className="flex">
                            <div className="mr-4">
                                <p className="text-black font-semibold">Email:</p>
                            </div>
                            <div>
                                <p className="text-gray-700">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex">
                            <div className="mr-4">
                                <p className="text-black font-semibold">Bio:</p>
                            </div>
                            <div>
                                <p className="text-gray-700">{user.bio || 'No bio available'}</p>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
