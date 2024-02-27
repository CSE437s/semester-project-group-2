

const URLs = new Map()

export function getURLs() {
    return URLs
}
export function addURL(pair) {
    URLs.set(pair.key, pair.value)
}
