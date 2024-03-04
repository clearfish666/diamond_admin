const Storage = {
  get(key) {
    if (!key) { return }
    const text = localStorage.getItem(key)
    if (text) {
      return JSON.parse(text)
    } else {
      localStorage.removeItem(key)
      return null
    }
  },
  set(key, data) {
    if (!key) {
      return
    }
    localStorage.setItem(key, JSON.stringify(data))
  },
  remove(key) {
    if (!key) {
      return
    }
    localStorage.removeItem(key)
  }
}

export default Storage
