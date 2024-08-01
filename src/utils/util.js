export const optionsForm = (method, body, headers) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(body),
    }

    return options;
}

export const optionsGet = (method) => {
    const options = {
        method
    }

    return options;
}