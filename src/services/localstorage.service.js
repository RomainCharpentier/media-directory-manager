const setItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getItem = (key) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

const removeItem = (key) => {
  localStorage.removeItem(key);
};

const clear = () => {
  localStorage.clear();
};

export { setItem, getItem, removeItem, clear };
