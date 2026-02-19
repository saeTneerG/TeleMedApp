import { METERED_DOMAIN, METERED_SECRET_KEY } from '../constants/config';

// Function to create a new room
export const createRoom = async () => {
    try {
        const response = await fetch(`https://${METERED_DOMAIN}/api/v1/room`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                secretKey: METERED_SECRET_KEY,
                roomName: `room-${Date.now()}` // Unique room name
            })
        });

        const data = await response.json();
        if (data.roomName) {
            return `https://${METERED_DOMAIN}/${data.roomName}`;
        } else {
            console.error('Failed to create room:', data);
            return null;
        }
    } catch (error) {
        console.error('Error creating Metered room:', error);
        return null;
    }
};

// Function to get a room URL (can be enhanced to validate existing rooms)
export const joinRoom = (roomName) => {
    return `https://${METERED_DOMAIN}/${roomName}`;
};
