import axios from 'axios';
import { logout, getCurrentUser, DeleteClass, changeRoleInClass, getAllUserHours, getUser, DropStudentFromClass, deleteUserHours } from '../UserUtils';
import { isCurrentlyOH, formatSchedule, formatTime, getNextTimeSlot } from '../scheduleUtils';

const DEBUGGING_MODE = process.env.REACT_APP_DEBUGGING
const url = DEBUGGING_MODE === "true" ? process.env.REACT_APP_DEBUGGING_BACKEND_URL : process.env.REACT_APP_BACKEND_URL

// jest.mock('axios', () => ({
//   get: jest.fn(),
// }));
jest.mock('axios');

const localStorageMock = (function () {
    let store = {};
    return {
        getItem(key) {
            return store[key] || null;
        },
        setItem(key, value) {
            store[key] = value.toString();
        },
        removeItem(key) {
            delete store[key];
        },
        clear() {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('getUser', () => {

    it('should store the token and retrieve the user profile on successful login', async () => {
        const mockToken = 'fakeToken123';
        const mockProfile = { id: 1, name: 'John Doe' };

        axios.post.mockResolvedValueOnce({
            data: { token: mockToken }
        });

        axios.get.mockResolvedValueOnce({
            data: { user: mockProfile }
        });

        const result = await getUser('email@example.com', 'password123');

        expect(axios.post).toHaveBeenCalledWith(`${url}/api/login`, {
            email: 'email@example.com',
            password: 'password123'
        });
        expect(axios.get).toHaveBeenCalledWith(`${url}/api/profile`, {
            headers: {
                Authorization: `Bearer ${mockToken}`,
                "ngrok-skip-browser-warning": true
            }
        });
        expect(result).toEqual({ data: { user: mockProfile } });
    });



    it('should alert "incorrect password" if login fails with specific error', async () => {
        window.alert = jest.fn();

        axios.post.mockResolvedValueOnce({
            data: { error: '"incorrect password"' }
        });

        const result = await getUser('email@example.com', 'wrongPassword');

        expect(window.alert).toHaveBeenCalledWith("incorrect password");
        expect(result).toBeUndefined();
    });

    it('should return error object on login or profile retrieval failure', async () => {
        const errorMessage = 'Network Error';
        axios.post.mockRejectedValueOnce(new Error(errorMessage));

        const result = await getUser('email@example.com', 'password123');

        expect(result).toEqual({ error: expect.any(Error) });
    });
});

describe('DropStudentFromClass', () => {
    const token = 'some-valid-token';
    const userId = 'user1';
    const classId = 'class1';
    const isTA = false;

    beforeEach(() => {
        localStorage.setItem('token', token);
        axios.post.mockClear();
    });

    afterEach(() => {
        localStorage.removeItem('token');
    });

    it('should send correct parameters to the server', async () => {
        axios.post.mockResolvedValue({ data: { message: "updated successfully" } });

        await DropStudentFromClass(userId, classId, isTA);

        expect(axios.post).toHaveBeenCalledWith(
            `${url}/api/dropStudentFromClass`,
            { userId, classId, isTA },
            { headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": true } }
        );
    });

    it('should return true when the server response is successful', async () => {
        axios.post.mockResolvedValue({ data: { message: "updated successfully" } });

        const result = await DropStudentFromClass(userId, classId, isTA);

        expect(result).toBe(true);
    });

    it('should return false when the server response indicates failure', async () => {
        axios.post.mockResolvedValue({ data: { message: "failed to update" } });

        const result = await DropStudentFromClass(userId, classId, isTA);

        expect(result).toBe(false);
    });

    it('should return null if no token is present', async () => {
        localStorage.removeItem('token');

        const result = await DropStudentFromClass(userId, classId, isTA);

        expect(result).toBeNull();
    });

    it('should handle exceptions by returning the error', async () => {
        const errorMessage = { message: "Network error" };
        axios.post.mockRejectedValue(errorMessage);

        const result = await DropStudentFromClass(userId, classId, isTA);

        expect(result).toEqual(errorMessage);
    });
});


describe('deleteUserHours', () => {
    // Setting up a mock for localStorage
    const token = 'test-token';
    beforeEach(() => {
        localStorage.setItem('token', token);
        axios.post.mockClear();
    });

    afterEach(() => {
        localStorage.removeItem('token');
    });

    it('should call axios with the correct parameters', async () => {
        const userId = 'user123';
        const classId = 'class456';

        axios.post.mockResolvedValue({ status: 200 });

        await deleteUserHours(userId, classId);

        expect(axios.post).toHaveBeenCalledWith(
            `${url}/api/deleteHours`,
            { userId, classId },
            { headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": true } }
        );
    });

    it('should return true when the response status is 200', async () => {
        axios.post.mockResolvedValue({ status: 200 });

        const response = await deleteUserHours('user123', 'class456');
        expect(response).toBe(true);
    });

    it('should return false when the response status is not 200', async () => {
        axios.post.mockResolvedValue({ status: 404 });

        const response = await deleteUserHours('user123', 'class456');
        expect(response).toBe(false);
    });

    it('should return false on request failure', async () => {
        axios.post.mockRejectedValue(new Error('Network error'));

        const response = await deleteUserHours('user123', 'class456');
        expect(response).toBe(false);
    });
});

describe('logout function', () => {
    beforeEach(() => {
        window.localStorage.clear();
        axios.get.mockClear();
    });

    it('should remove the token from localStorage and call the logout API', async () => {
        window.localStorage.setItem('token', '12345');
        axios.get.mockResolvedValue({ data: true });

        const result = await logout();

        expect(window.localStorage.getItem('token')).toBeNull();
        expect(axios.get).toHaveBeenCalledWith(url + "/api/logout");
        expect(result).toBe(true);
    });
});

describe('getCurrentUser function', () => {
    beforeEach(() => {
        localStorage.clear();
        axios.get.mockClear();
    });

    it('should fetch user data successfully from the API when token is present', async () => {
        const mockUserData = { data: { id: 1, name: 'John Doe' } };
        localStorage.setItem('token', '12345');
        axios.get.mockResolvedValue(mockUserData);

        const result = await getCurrentUser();

        expect(localStorage.getItem('token')).not.toBeNull();
        expect(axios.get).toHaveBeenCalledWith(`${url}/api/profile`, {
            headers: {
                Authorization: "Bearer 12345",
                "ngrok-skip-browser-warning": true
            }
        });
        expect(result).toEqual(mockUserData);
    });

    it('should return an error object when no token is stored', async () => {
        const result = await getCurrentUser();

        expect(localStorage.getItem('token')).toBeNull();
        expect(result).toEqual({ "error": "token is not stored" });
    });

    it('should handle API failure by returning an error object', async () => {
        localStorage.setItem('token', '12345');
        const errorResponse = {
            response: {
                status: 401
            }
        };
        axios.get.mockRejectedValue(errorResponse);

        const result = await getCurrentUser();

        expect(axios.get).toHaveBeenCalledWith(`${url}/api/profile`, {
            headers: {
                Authorization: "Bearer 12345",
                "ngrok-skip-browser-warning": true
            }
        });
        expect(result).toEqual({ "message": "token has expired. logout and redirect to login", status: 401 });
    });
});


describe('DeleteClass function', () => {
    it('should successfully delete a class', async () => {
        axios.post.mockResolvedValue({ data: { message: "deleted successfully" } });

        const result = await DeleteClass(101);

        expect(axios.post).toHaveBeenCalledWith(`${url}/api/deleteClass`, { classId: 101 }, expect.any(Object));
        expect(result).toBe(true);
    });

    it('should return false when deletion fails', async () => {
        axios.post.mockResolvedValue({ data: { message: "deletion failed" } });

        const result = await DeleteClass(101);

        expect(axios.post).toHaveBeenCalledWith(`${url}/api/deleteClass`, { classId: 101 }, expect.any(Object));
        expect(result).toBe(false);
    });
});

describe('changeRoleInClass function', () => {
    it('should successfully change a user role', async () => {
        axios.post.mockResolvedValue({ data: { message: "successfully updated" } });

        const result = await changeRoleInClass(1, 101, 'student', 'TA');

        expect(axios.post).toHaveBeenCalledWith(`${url}/api/changeRoleInClass`, {
            userId: 1,
            classId: 101,
            oldRole: 'student',
            newRole: 'TA'
        }, expect.any(Object));
        expect(result).toBe(true);
    });

    it('should return false when role update fails', async () => {
        axios.post.mockResolvedValue({ data: { message: "update failed" } });

        const result = await changeRoleInClass(1, 101, 'student', 'TA');

        expect(axios.post).toHaveBeenCalledWith(`${url}/api/changeRoleInClass`, {
            userId: 1,
            classId: 101,
            oldRole: 'student',
            newRole: 'TA'
        }, expect.any(Object));
        expect(result).toBe(false);
    });
});

describe('getAllUserHours function', () => {
    beforeEach(() => {
        window.localStorage.clear();
        axios.post.mockClear();
    });

    it('should return a rejection if token is not present', async () => {
        const userId = 1;
        await expect(getAllUserHours(userId)).rejects.toMatch("Token is not stored");
    });

    it('should fetch user hours if token is present', async () => {
        const mockHours = ['9 AM - 5 PM', '10 AM - 4 PM'];
        window.localStorage.setItem('token', 'valid-token');
        axios.post.mockResolvedValue({ data: { hours: mockHours } });

        const userId = 1;
        const result = await getAllUserHours(userId);

        expect(axios.post).toHaveBeenCalledWith(`${process.env.REACT_APP_BACKEND_URL}/api/getHours`, { userId: userId }, {
            headers: {
                Authorization: "Bearer valid-token",
                "ngrok-skip-browser-warning": true
            }
        });
        expect(result).toEqual(mockHours);
    });

    it('should return null if there is an error in the response', async () => {
        window.localStorage.setItem('token', 'valid-token');
        axios.post.mockResolvedValue({ error: true });

        const userId = 1;
        const result = await getAllUserHours(userId);

        expect(result).toBeNull();
    });
});


describe('Utility Functions', () => {
    describe('isCurrentlyOH', () => {
        it('should return true if current time is within office hours', () => {
            const hoursArray = [
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Monday
                [], // Tuesday
                [], // Wednesday
                [], // Thursday
                [], // Friday
                [], // Saturday
                [], // Sunday
            ];

            const currentTime = new Date('2021-03-01T08:00:00'); // Monday 8 AM
            expect(isCurrentlyOH(hoursArray, currentTime)).toBe(true);
        });

        it('should return false if current time is not within office hours', () => {
            const hoursArray = [
                [], // Monday
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Tuesday
            ];

            const currentTime = new Date('2021-03-02T11:30:00'); // Tuesday 11:30 AM
            expect(isCurrentlyOH(hoursArray, currentTime)).toBe(false);
        });
    });

    describe('formatSchedule', () => {
        it('should format the schedule correctly', () => {
            const hoursArray = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];
            const formatted = formatSchedule(hoursArray);
            expect(formatted[0].hours).toContain('8:00 AM-10:00 PM');
        });
    });

    describe('formatTime', () => {
        it('should format time correctly with AM and PM', () => {
            expect(formatTime(13, '00')).toBe('1:00 PM');
            expect(formatTime(12, '00')).toBe('12:00 PM');
            expect(formatTime(12, '30')).toBe('12:30 PM');
            expect(formatTime(0, '00')).toBe('12:00 AM');
        });
    });

    describe('getNextTimeSlot', () => {
        it('should return the next half-hour time slot correctly', () => {
            expect(getNextTimeSlot('11:30 AM')).toBe('12:30 AM');
            expect(getNextTimeSlot('11:00 AM')).toBe('11:30 AM');
            expect(getNextTimeSlot('12:30 PM')).toBe('13:00 PM');
        });
    });
});