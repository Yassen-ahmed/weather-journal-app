
/* Global Variables */
const apiKey = 'ce1851b2e2f6e29c6d67b23da3cbf352';
const feelingsInput = document.getElementById('feeling');
const tokenInput = document.getElementById("key");
const zipInput = document.getElementById("zip");
const contentInput = document.getElementById("content");
const dateInput = document.getElementById("date");
const tempInput = document.getElementById("temp");
// Third party api url & our own server endpoints url's
const weatherURL = "api.openweathermap.org/data/2.5/weather?";
const fetchURL = "http://localhost:5000/get-latest";
const saveURL = "http://localhost:5000/save";


const month = monthIndex => {
  return [
    'Jan', 'Feb','March','April','May','June',
    'July','Aug','Sept','Oct',
    'Nov','Dec'
  ][monthIndex];
};

// Create a new date instance dynamically with JS. It will be used as today's date
let date = new Date();
let currentDate = month(date.getMonth()) + " " + date.getDate() + ", " + date.getFullYear();

const fetchWeatherData = async (token, zip = "11230") => {
  // we build our data necessary for doing the fetch operation from weather api
  const url = `http://${weatherURL}zip=${zip}&appid=${token || apiKey}&units=imperial`;
  const response = await fetch(url);
  return await response.json();
};


const postData = async (path, data = {}) => {
  await fetch(path, {
    method: "POST",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json"
    },
    redirect: "follow",
    body: JSON.stringify(data)
  })
};


// Method used to fetch latest entry and update our UI with this information.
const fetchLatestEntryAndUpdateUI = async () => {
  const response = await fetch(fetchURL);
  const jsonData = await response.json();

  if (jsonData != null) {
    const { content, date, temp } = jsonData;
    contentInput.innerHTML = "Message: " + content;
    dateInput.innerHTML = "Date: " + date;
    tempInput.innerHTML = "Temperature: " + temp + "°F";
  }
};

// Method used to save a journal entry
const saveEntry = async () => {
  const feelings = feelingsInput.value ? feelingsInput.value.trim() : null;
  const token = tokenInput.value ? tokenInput.value.trim() : null;
  const zip = zipInput.value ? zipInput.value.trim() : null;

  if (feelings === null) {
    window.alert("A journal entry about today's feelings is required in order to perform save operation.");
    return;
  }

  if (zip === null) {
    window.alert("Default zip code 11230 will be used as you have not provided a value.");
  }

  await fetchWeatherData(token, zip || "11230").then((response) => {
    if (response != null) {
      // we check our response to see if we are in the city not found situation
      const errCode = response.cod;
      const errMessage = response.message;

      if (errCode === "404" || errMessage === "city not found") {
        window.alert("City was not found based on the zip value you've entered. Please enter a US zip code.");
      } else {
        const timestamp = new Date();
        const dataEntry = {
          temp: response.main ? response.main.temp : null,
          date: `${month(timestamp.getMonth())} / ${timestamp.getDate()} / ${timestamp.getFullYear()}`,
          content: feelingsInput.value
        };
        postData(saveURL, dataEntry).then(() => {
          window.alert("Entry was saved successfully!");
          fetchLatestEntryAndUpdateUI().then(() => {
            window.alert("Latest entry was updated successfully!");
          });
        });
      }
    } else {
      window.alert("There was an error!");
    }
  }).catch(() => {
    // we are in situation of a server error so we need to let the user know about it
    window.alert("Server error! Please try again.");
    return null;
  });
};

// We set the event listener for the element with the id of "generate"
const saveButton = document.getElementById("generate");
saveButton.addEventListener("click", saveEntry);
