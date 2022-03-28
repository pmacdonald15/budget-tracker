let db; // db connection
const request = indexedDB.open('budget_tracker', 1); // for offline persistence

// updates on db changes
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore('transaction', { autoIncrement: true });
};

// upon a successful db request
request.onsuccess = function (event) {
  db = event.target.result;

  // check if app is online, if yes run uploadTransaction() function to send all local db data to api
  if (navigator.onLine) {
    uploadTransaction();
  }
};

// on request error
request.onerror = function (event) {
  console.log(event.target.errorCode);
};

// no internet connection
function saveRecord(record) {
  const transaction = db.transaction(['transaction'], 'readwrite');

  const transactionObjectStore = transaction.objectStore('transaction');

  transactionObjectStore.add(record);
}

function uploadTransaction() {
  const transaction = db.transaction(['transaction'], 'readwrite');

  const transactionObjectStore = transaction.objectStore('transaction');

  const getAll = transactionObjectStore.getAll();

  // upon a successful .getAll() execution, run this function
  getAll.onsuccess = function () {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(['transaction'], 'readwrite');
          let transactionsObjectStore = transaction.objectStore('transaction');
          // clear all transactions in your store
          transactionsObjectStore.clear();

          alert('All saved transactions have been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

};

// listen for app coming online
window.addEventListener('online', uploadTransaction);