function searchChapters(query) {
  const data = window.BOOK_DATA?.chapters || [];

  return data.filter(ch =>
    ch.g.includes(query) ||
    ch.nm.includes(query)
  );
}

window.searchChapters = searchChapters;
