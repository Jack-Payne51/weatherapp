const locationInput = document.getElementById('location-input');
const searchButton = document.getElementById('search-button');
const currentLocationButton = document.getElementById('current-location-button');
const historicalDataButton = document.getElementById('historical-data-button');
const historicalWeatherInfo = document.getElementById('historical-weather-info');
const weatherInfo = document.getElementById('weather-info');
const locationName = document.getElementById('location-name');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');

let currentLatitude = null;
let currentLongitude = null;

locationInput.addEventListener('keyup', (event) => {
  if (event.keyCode === 13) { 
    event.preventDefault();
    searchButton.click();
  }
});


searchButton.addEventListener('click', () => {
  const query = locationInput.value.trim();
  const geocodeUrl = `https://geocode.maps.co/search?q=${query}`;

  fetch(geocodeUrl)
    .then((response) => response.json())
    .then((locationData) => {
      currentLatitude = locationData[0].lat;
      currentLongitude = locationData[0].lon;

      fetchWeather(currentLatitude, currentLongitude, query);
    })
    .catch((error) => {
      alert('An error occurred while retrieving location information.');
      console.error(error);
    });
});

currentLocationButton.addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition((position) => {
    currentLatitude = position.coords.latitude;
    currentLongitude = position.coords.longitude;

    fetchWeather(currentLatitude, currentLongitude, 'Your Current Location');
  }, (error) => {
    alert('Geolocation is not supported or permission was denied.');
    console.error(error);
  });
});
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const dateButtons = document.querySelectorAll('.date-btn');

dateButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const range = e.target.getAttribute('data-range');
      let startDate, endDate;
  
      endDate = new Date();
      endDate.setDate(endDate.getDate() - 6); // Set end date to 6 days before today
  
      switch (range) {
        case 'month':
          startDate = new Date(endDate);
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate = new Date(endDate);
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
  
      startDateInput.value = startDate.toISOString().slice(0, 10);
      endDateInput.value = endDate.toISOString().slice(0, 10);
    });
});


historicalDataButton.addEventListener('click', () => {
    if (currentLatitude && currentLongitude) {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
    
        if (!startDate || !endDate) {
          alert('Please select both the start and end dates.');
          return;
        }
    
    const apiUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${currentLatitude}&longitude=${currentLongitude}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,sunrise,sunset,precipitation_sum&timezone=auto`;
  
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        const historicalData = data.daily;
        const categories = historicalData.time.map((date) => new Date(date).toLocaleDateString());
        const maxTemps = historicalData.temperature_2m_max;
        const minTemps = historicalData.temperature_2m_min;
        const meanTemps = historicalData.temperature_2m_mean;
  
        // Create the chart
        Highcharts.chart('historical-chart', {
          title: {
            text: `Historical Weather Data from ${startDate} to ${endDate}`,
          },
          xAxis: {
            categories: categories,
            title: {
              text: 'Date',
            },
          },
          yAxis: {
            title: {
              text: 'Temperature (°C)',
            },
          },
          series: [
            {
              name: 'Max Temperature',
              data: maxTemps,
            },
            {
              name: 'Min Temperature',
              data: minTemps,
            },
            {
              name: 'Mean Temperature',
              data: meanTemps,
            },
          ],
        });
  
        // Create the table
        let html = `<table><caption>Historical Weather Data from ${startDate} to ${endDate}</caption><tr><th>Date</th><th>Max Temperature</th><th>Min Temperature</th><th>Mean Temperature</th><th>Sunrise</th><th>Sunset</th><th>Precipitation Sum</th></tr>`;
        for (let i = 0; i < historicalData.time.length; i++) {
          html += `<tr>
          <td data-label="Date">${categories[i]}</td>
          <td data-label="Max Temperature">${maxTemps[i]}°C</td>
          <td data-label="Min Temperature">${minTemps[i]}°C</td>
          <td data-label="Mean Temperature">${meanTemps[i]}°C</td>
          <td data-label="Sunrise">${new Date(historicalData.sunrise[i]).toLocaleTimeString()}</td>
          <td data-label="Sunset">${new Date(historicalData.sunset[i]).toLocaleTimeString()}</td>
          <td data-label="Precipitation Sum">${historicalData.precipitation_sum[i]} mm</td>
        </tr>`;
        }
        html += '</table>';
        document.getElementById('historical-table').innerHTML = html;
        document.getElementById('historical-chart').classList.add('show');
        document.getElementById('historical-table').classList.add('show');
        document.getElementById('historical-data').classList.remove('hide');
      })
      .catch((error) => {
        alert('An error occurred while retrieving historical weather data.');
        console.error(error);
      });
    } else {
        alert('Please search for a location first to view historical data.');
      }
});


const forecastButton = document.getElementById('forecast-button');

forecastButton.addEventListener('click', () => {
  if (currentLatitude && currentLongitude) {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${currentLatitude}&longitude=${currentLongitude}&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&current_weather=true&timezone=auto`;
    
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        const forecastData = data.daily;
        const categories = forecastData.time.map((date) => new Date(date).toLocaleDateString());
        const maxTemps = forecastData.temperature_2m_max;
        const minTemps = forecastData.temperature_2m_min;
        const uvIndexMax = forecastData.uv_index_max;

        // Create the chart
        Highcharts.chart('forecast-chart', {
          title: { text: '7-Day Weather Forecast' },
          xAxis: { categories: categories, title: { text: 'Date' } },
          yAxis: [
            {
              title: { text: 'Temperature (°C)' },
              opposite: false,
            },
            { 
              title: { text: 'UV Index Max' },
              opposite: true,
            },
          ],
          series: [
            {
                name: 'UV Index Max',
                data: uvIndexMax,
                type: 'column', 
                yAxis: 1, 
            },
            { name: 'Max Temperature', data: maxTemps },
            { name: 'Min Temperature', data: minTemps },

          ],
        });

        // Create the table
        let html = '<table><caption>7-Day Weather Forecast</caption><tr><th>Date</th><th>Max Temperature</th><th>Min Temperature</th><th>Sunrise</th><th>Sunset</th><th>UV Index Max</th></tr>';
        for (let i = 0; i < forecastData.time.length; i++) {
          html += `<tr>
          <td data-label="Date">${categories[i]}</td>
          <td data-label="Max Temperature">${maxTemps[i]}°C</td>
          <td data-label="Min Temperature">${minTemps[i]}°C</td>
          <td data-label="Sunrise">${new Date(forecastData.sunrise[i]).toLocaleTimeString()}</td>
          <td data-label="Sunset">${new Date(forecastData.sunset[i]).toLocaleTimeString()}</td>
          <td data-label="UV Index Max">${forecastData.uv_index_max[i]}</td>
          </tr>`;
        }
        html += '</table>';
        document.getElementById('forecast-table').innerHTML = html;
        document.getElementById('forecast-chart').classList.add('show');
        document.getElementById('forecast-table').classList.add('show');
        document.getElementById('forecast-data').classList.remove('hide');
      })
      .catch((error) => {
        alert('An error occurred while retrieving the 7-day weather forecast.');
        console.error(error);
      });
  } else {
    alert('Please search for a location first to view the 7-day forecast.');
  }
});


function fetchWeather(latitude, longitude, locationLabel) {
    locationLabel = locationLabel.replace(/\b\w/g, (l) => l.toUpperCase());

 fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m`)
    .then((response) => response.json())
    .then((weatherData) => {
      locationName.innerText = locationLabel;
      temperature.innerText = `${weatherData.current_weather.temperature}°C`;
      description.innerText = `Latitude: ${latitude}, Longitude: ${longitude}\nWind Speed: ${weatherData.current_weather.windspeed} m/s, Wind Direction: ${weatherData.current_weather.winddirection}°`;
      document.getElementById('weather-info').classList.add('show');
      weatherInfo.classList.remove('hide');
    })
    .catch((error) => {
      alert('Weather information not available for this location.');
      console.error(error);
    });
}
