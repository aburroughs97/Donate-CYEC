export async function apiPost(url, data) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return await response.json();
};

export async function apiGet(url) {
    const response = await fetch(url, {
        method: 'GET',
    });
    return await response.json();
}