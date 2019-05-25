import './general';
console.log("inside weather.js");
//http://api.openweathermap.org/data/2.5/forecast?zip=97405&units=imperial&appid=c59493e7a8643f49446baf0d5ed9d646

/* Create a class called Weather
- Part 1 - Retrieve the weather information when the user clicks the buttobn
  - Create the constructor
    - initialize instance variables for the "state" of the app and the ajax call
        this.state = {
          zipcode: "",
          city: {},
          forecast: [],
          simpleForecast: [], 
          selectedDate: null
        };
        this.url = "http://api.openweathermap.org/data/2.5/forecast?zip=";
        this.apikey = "&units=imperial&appid=c59493e7a8643f49446baf0d5ed9d646";
    - initialize instance variables for UI elements
        the form
        the zipcode input element
        the weather list div
        the current day div
    - write the stub of a method onFormSubmit
    - bind the class to onFormSubmit
    - add a submit handler to the form that calls onFormSubmit
  - Write the method onFormSubmit.  It should
    - prevent the form from being sumbitted to the server
    - get the zip code from the UI and put it in a variable
    - call fetch with the url zipcode and apikey
      - when the response comes back THEN parse the json
      - when that finishes THEN 
        - set the city in the state object
        - set the forecast in the state object
        - set the simpleForecast in the state object 
            by calling the method parseForecast (see bottom of file)
        - set the selectedDate to null
        - clear the zipcode from the UI
        - call the method renderWeatherList and pass this.state.simpleForecast as the arg
  - Write a first version of renderWeatherList.  It has forecast (which is 5 element simplified forcast array) as a parameter.
    - console.log the value of forecast.
  - Edit the constructor to bind the class to the method renderWeatherList
  */
class Weather {
  constructor() {
    this.state = {
      zipcode: "97401",
      city: {},
      forecast: [],
      simpleForecast: [],
      selectedDate: null,
      timezoneOffset: -7
    }; 
    this.form = document.getElementById("zipForm");
    this.zipcode = document.getElementById("zipcode");
    this.weatherList = document.getElementById("weatherList");
    this.currentDay = document.getElementById("currentDay");
    this.url = "http://api.openweathermap.org/data/2.5/forecast?zip=";
    this.apikey = "&units=imperial&appid=e9172124c6178b2d350f6385777db45c";
    //google api key
    this.googleApiKey = "AIzaSyAsmbWuvBtW08mB7uX9yqebfpEEpAAn8DY";
    this.googleMapsUrl = "https://maps.googleapis.com/maps/api/timezone/json?location=";
    
    
    console.log("In the constructor");
    //bind the class to onFormSubmit-MWB_5/22/2019
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.renderWeatherList = this.renderWeatherList.bind(this);
    this.parseForecast = this.parseForecast.bind(this);
    //add a submit handler to the form that calls onFormSubmit-MWB_5/22/2019
    this.form.onsubmit = this.onFormSubmit.bind(this);
  }
  //write the stub of a method onFormSubmit-MWB_5/16/2019
  onFormSubmit(event) {
    console.log("in onform submit")
    //prevent the form from being sumbitted to the server-MWB_5/22/2019
    event.preventDefault(event);

    //get the zip code from the UI and put it in a variable-MWB_5/22/2019
    this.state.zipcode = document.querySelector('#zipcode').value;

    //call fetch with the url zipcode and apikey-MWB_5/22/2019
    fetch(`${this.url}${this.state.zipcode}${this.apikey}`)
	    .then(response => response.json())
        .then(data => { 
            this.state.city = data.city;
            this.state.forecast = data.list;
            this.state.selectedDate = null;
            fetch(`${this.googleMapsUrl}
                ${this.state.city.coord.lat},${this.state.city.coord.lon}
                &timestamp=${this.state.forecast[0].dt}
                &key=${this.googleApiKey}`)
                .then(response => response.json())
                .then(tzdata => {
                    this.state.timezoneOffset =  (tzdata.rawOffset + tzdata.dstOffset) / (60 * 60);
                    
                    let forecast = this.parseForecast(this.state.forecast, this.state.timezoneOffset);
                    
                    this.state.simpleForecast = forecast;
                    //console.log("just before zipcode.value")
                    this.zipcode.value = "";        
                    // this is where you'll call the method that writes the data to the page
                    //console.log("just after zipcode: " + JSON.stringify(zipcode))
                    this.renderWeatherList(this.state.simpleForecast);
                    console.log("inside fetch simple forecast: " + JSON.stringify(this.state.simpleForecast))
                    //console.log("end of fetch block" + JSON.stringify(this.state.simpleForecast))
                })
                .catch(tzError => {
                  console.log("unable to connect:" + JSON.stringify(tzError));
                    alert('There was a problem getting timezone info!')
                });
        })
        .catch(error => {
            alert('There was a problem getting info!'); 
        });
  }



  /*
END OF PART 1 - TEST AND DEBUG YOUR APP

- Part 2 - Format ONE weather list item and the weather list as a whole
  - Write the method renderWeatherListItem
    - This method returns a template literal containing the html for the weather for ONE day.
      It gets called in renderWeatherList.  It has 2 parameters a forecast and an index.
      The forecastDay is a js object from the "parsed" version of the return from the weather api.
    - Format the weather information for one day on the html page.  At a minimum it should include
      - the month and day as well as the weekday
      - the high and low temperatures for that day
      - the element should be styled with weather-list-item as well
    - CUT the html for ONE day from your html page into the body of your method.
      - Enclose the html in ``.
      - Replace the hardcoded month and day, weekday, high and low temperatures 
        with template strings that use the properties of the forecastDay object
      - Return the template literal 
  - Edit the body of the method renderWeather list.  It should
    - Create the html for each of the weather list items.  Use the array method map to do this.
      const itemsHTML = forecast.map((forecastDay, index) => this.renderWeatherListItem(forecastDay, index)).join('');
    - Set the inner html of the weatherList element on the page to 
      - a div element styled with weather-list flex-parent
      - that contains the itemsHTML from above
END OF PART 2 - TEST AND DEBUG YOUR APP
*/
getIndexOfMidnight(firstDate, timezoneOffset) {
  let dt = firstDate * 1000;
  let date = new Date(dt);
  let utcHours = date.getUTCHours();
  let localHours = utcHours + timezoneOffset;
  let firstMidnightIndex = (localHours > 2 ) ? 
      Math.round((24 - localHours)/3) : 
      Math.abs(Math.round(localHours / 3));
  return firstMidnightIndex;
}

findMinTemp(forecast, indexOfMidnight) {
  let min = forecast[indexOfMidnight].main.temp_min;
  for (let i = indexOfMidnight + 1; i < indexOfMidnight + 8; i++)
    if (forecast[i].main.temp_min < min)
      min = forecast[i].main.temp_min;
  return min;
}

findMaxTemp(forecast, indexOfMidnight) {
  let max = forecast[indexOfMidnight].main.temp_max;
  for (let i = indexOfMidnight + 1; i < indexOfMidnight + 8; i++)
    if (forecast[i].main.temp_max > max)
      max = forecast[i].main.temp_max;
  return max;
}

parseForecast(forecast, timezoneOffset) {
  //console.log("about to parse the forecast");
  let simpleForecast = new Array();
  const MIDNIGHT = this.getIndexOfMidnight(forecast[0].dt, timezoneOffset);
  //console.log("get index of midnight");
  const NOON = 4;
  const SIXAM = 2;
  const SIXPM = 6;
  const NINEPM = 7;
  const MORNING = SIXAM;
  const DAY = NOON;
  const EVENING = SIXPM;
  const NIGHT = NINEPM;
  const PERDAY = 8;
  const DAYS = 4;
  
  for (let i = MIDNIGHT; i < forecast.length - NINEPM; i+=PERDAY) {
    let oneDay = new Object();
    oneDay.dt = forecast[i + NOON].dt;
    oneDay.temp = forecast[i + NOON].main.temp;
    oneDay.minTemp = this.findMinTemp(forecast, i);
    oneDay.maxTemp = this.findMaxTemp(forecast, i);
    oneDay.morningTemp = forecast[i + MORNING].main.temp;
    oneDay.dayTemp = forecast[i + DAY].main.temp;
    oneDay.eveningTemp = forecast[i + EVENING].main.temp;
    oneDay.nightTemp = forecast[i + NIGHT].main.temp;
    oneDay.description = forecast[i + NOON].weather[0].description;
    oneDay.icon = forecast[i + NOON].weather[0].icon;
    oneDay.pressure = forecast[i+NOON].main.pressure;
    oneDay.wind = forecast[i + NOON].wind.speed;
    oneDay.humidity = forecast[i + MORNING].main.humidity;
    simpleForecast.push(oneDay);
  }
  //console.log("inside of parseForecast" + JSON.stringify(forecast));
  return simpleForecast;
}



renderWeatherList(forecast)
{
  console.log("inside start of renderWeatherList just before renderWeatherListItem");

    const itemsHTML = forecast.map((forecast, index) => this.renderWeatherListItem(forecast, index)).join('');
  //console.log("items html" + JSON.stringify(itemsHTML));
  console.log("just after renderWeatherListItem");

    document.getElementById("weatherList").innerHTML = `<div class="weather-list flex-parent">${itemsHTML}</div>`;
    let days = document.querySelectorAll(".weather-list-item");
    for(let i=0; i<days.length; i++)
    {
      days[i].onclick=this.renderCurrentDay.bind(this, i);
    }
    //console.log("end of renderweatherList")
}

renderWeatherListItem(forecast, index)
{
  console.log("inside start of renderWeatherListItem" + JSON.stringify(forecast));
    let date = new Date(forecast.dt*1000);
    return `<div class="weather-list-item" data-index=${index}>
          <h2> ${date.getMonth() +1} / ${date.getDate()} </h2>
          <h3> ${date.getDay()}</h3>
          <h3> ${forecast.minTemp} &deg;F &#124; ${forecast.maxTemp} &deg;F</h3>
      </div>`;
    
}


renderCurrentDay(index)
{
  console.log("inside start of parse forecast" + JSON.stringify(index));
  let date = new Date(this.state.forecast[index].dt*1000);
  let oneDay = this.state.forecast[index];
  console.log("forecast:" + JSON.stringify(this.state.forecast[index]))
  this.currentDay.innerHTML =
  `
  <div class="current-day">
	<h1 class="day-header">${date.getDay()+1}</h1>
    <div class="weather">
        <p><img src='http://openweathermap.org/img/w/ICON.png' alt="DESCRIPTION"/>
            ${oneDay["weather"][0]["description"]}
        </p>
    </div>
    <div class="details flex-parent">
	    <div class="temperature-breakdown">
            <p>Morning Temperature: ${oneDay["main"]["temp_min"]} &deg;F</p>
            <p>Humidity: ${oneDay["main"]["humidity"]}</p>
            <p>Day Temperature: ${oneDay["main"]["temp"]} &deg;F</p>
            <p>Evening Temperature: ${oneDay["main"]["temp_max"]} &deg;F</p>
            <p>Night Temperature: ${oneDay["main"]["temp_kf"]} &deg;F</p>
	    </div>
    </div>
</div>`;
}
/*
- Part 3 - Display weather details when the user clicks one weather list item
  - Write the method renderCurrentDay.  It takes the index of the day as it's parameter.
    - Format the detailed weather information for the selected day on the html page. Include at least
      - identifying information for the city as well as the date
      - description and icon for the weather
      - temperatures throughout the day
      - humidity and wind information
    - CUT the html for the weather details and paste it into the body of your method
      - Enclose the html in ``.
      - Replace the hardcoded text with data.  The data is in the state instance variable.
      - Set the innerhtml property of the currentDay element on the page
  - Add a click event handler to each of the weather list items 
    - add a loop to the end of the renderWeatherList method that adds the event handler
    - you'll have to bind the method renderCurrentDay to both the class and the index of the item
  - Write the method clearCurrentDay.  It sets the inner html property of the currentDay element to ""
  - Call clearCurrentDay at the end of onFormSubmit
END OF PART 3 - TEST AND DEBUG YOUR APP
*/

  // Don't forget to instantiate the a weather object!

  /*
    parseForecast(forecast) {
      let simpleForecast = new Array();
      const NOON = 4;
      const SIXAM = 2;
      const SIXPM = 6;
      const NINEPM = 7;
      const MORNING = SIXAM;
      const DAY = NOON;
      const EVENING = SIXPM;
      const NIGHT = NINEPM;
      const PERDAY = 8;
      const DAYS = 5;
      for (let i = 0; i < forecast.length; i+=PERDAY) {
        let oneDay = new Object();
        oneDay.dt = forecast[i + NOON].dt;
        oneDay.temp = forecast[i + NOON].main.temp;
        oneDay.minTemp = forecast[i + SIXAM].main.temp_min;
        oneDay.maxTemp = forecast[i + SIXPM].main.temp_max;
        oneDay.morningTemp = 
        oneDay.dayTemp = 
        oneDay.eveningTemp = 
        oneDay.nightTemp = 
        oneDay.description = 
        oneDay.icon = 
        oneDay.pressure = 
        oneDay.wind = 
        oneDay.humidity = 
        simpleForecast.push(oneDay);
      }
      return simpleForecast;
    }
  */
}

window.onload=()=>{new Weather()};

