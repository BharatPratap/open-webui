import { WEBUI_HOSTNAME } from '$lib/constants';

export const fetchUserContext = async (token: string = '', user_id: string = '12121') => {
    let controller = new AbortController();
    let error = null;

    const res = await fetch(`${WEBUI_HOSTNAME}/api/v1/chats/user-context?user_id=${user_id}`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
    }).catch((err) => {
        error = err;
        return null;
    });

    if (error) {
        throw error;
    }

    return res;
};




