import { METERED_DOMAIN, METERED_SECRET_KEY } from '../constants/config';

const buildRoomName = (roomId) => {
    if (!roomId) return `room-${Date.now()}`;
    const normalized = String(roomId).trim();
    if (!normalized) return `room-${Date.now()}`;
    // Avoid generating room-room-xxx when caller already passes a room name.
    if (/^room-/i.test(normalized)) return normalized.toLowerCase();
    return `room-${normalized}`.toLowerCase();
};

const buildRoomUrl = (roomName) => `https://${METERED_DOMAIN}/${encodeURIComponent(roomName)}`;

const isAlreadyExistsMessage = (message) =>
    typeof message === 'string' && /already exist|already exists/i.test(message);

const extractExistingRoomName = (message) => {
    if (typeof message !== 'string') return null;
    const match = message.match(/room with the name\s+([^\s]+)\s+already exist/i);
    return match?.[1] || null;
};

// Function to create or join a room
export const createRoom = async (roomId) => {
    if (!METERED_DOMAIN || !METERED_SECRET_KEY) {
        console.error('Metered config missing: METERED_DOMAIN or METERED_SECRET_KEY');
        return null;
    }

    const roomName = buildRoomName(roomId);
    const url = `https://${METERED_DOMAIN}/api/v1/room?secretKey=${METERED_SECRET_KEY}`;
    console.log('Metered Request URL:', url);
    console.log('Metered Domain:', METERED_DOMAIN);
    console.log('Metered Secret Key defined:', !!METERED_SECRET_KEY);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomName: roomName
            })
        });

        let data = null;
        try {
            data = await response.json();
        } catch (_) {
            data = null;
        }
        console.log('Metered create room response:', response.status, data);

        if (response.ok && data?.roomName) {
            const createdUrl = buildRoomUrl(data.roomName);
            console.log('Metered room created/joined URL:', createdUrl);
            return createdUrl;
        }

        // Existing deterministic room can be reused.
        if (roomId && isAlreadyExistsMessage(data?.message)) {
            const existingRoomName = extractExistingRoomName(data?.message) || roomName;
            const existingUrl = buildRoomUrl(existingRoomName.toLowerCase());
            console.log('Metered room already exists, reuse URL:', existingUrl);
            return existingUrl;
        }

        console.error('Failed to create Metered room:', response.status, data);
        return null;
    } catch (error) {
        console.error('Error creating Metered room:', error);
        return null;
    }
};

// Function to get a room URL (can be enhanced to validate existing rooms)
export const joinRoom = (roomName) => {
    return buildRoomUrl(roomName);
};
