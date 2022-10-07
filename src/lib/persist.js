export const Persisted = key => {
    return {
        set: value => localStorage.setItem(key, JSON.stringify(value)),
        get: () => JSON.parse(localStorage.getItem(key)),
        clear: () => localStorage.removeItem(key)
    }
}
