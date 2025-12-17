import { useState, useEffect } from "react";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../api";

export function useWatchlist() {
  const [list, setList] = useState([]);

  // Load watchlist once
  useEffect(() => {
    getWatchlist().then((data) => {
      const arr = Array.isArray(data) ? data : data?.items || [];
      setList(arr);
    });
  }, []);
  // Is this movie already in my list?
  function isInList(id) {
    return list.some((i) => i.id === id);
  }
  // Decides whether to add or remove movie
  async function toggle(item) {
    if (isInList(item.id)) {
      await removeFromWatchlist(item.id);
      setList(list.filter((i) => i.id !== item.id));
    } else {
      await addToWatchlist(item);
      setList([...list, item]);
    }
  }

  return {
    list,
    isInList,
    add: (item) => toggle(item),
    remove: (id) => toggle({ id }),
    toggle,
  };
}
