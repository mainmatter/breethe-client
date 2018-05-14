import Store from '@orbit/store';

export default function restoreCache(store: Store)  {
  let cacheContainer = document.querySelector('#orbit-main-cache');
  if (cacheContainer) {
    let data = JSON.parse(cacheContainer.innerHTML);
    data.forEach((record) => {
      store.cache.patch((t) => t.addRecord(record));
    });
  }
}
