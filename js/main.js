// 'use strict'
const url = 'https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=56.84,55.27,33.48,41.48';
const airportCoord = [55.410307, 37.902451];
const tableBody = document.querySelector('table.table tbody');

class AppTableAirCraft {
  constructor(url, airportCoord, tableBody) {
    this.airportCoord = airportCoord;
    this.tableBody = tableBody;
    this.url = url;
    this.mapMatching = {
      lat: 1,
      lon: 2,
      course: 3,
      altitude: 4,
      speed: 5,
      from: 11,
      to: 12,
      flight: 13,
    };
  }
  getData(url) {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        let payload = [];
        let formatData = {
          coord: [],
          course: null,
          altitude: null,
          speed: null,
          from: null,
          to: null,
          flight: null,
        };
        for (let i in data) {
          if (typeof data[i] === 'object') {
            for (let k in data[i]) {
              for (let j in this.mapMatching) {
                if (+this.mapMatching[j] === +k) {
                  if (j === 'lat' || j === 'lon') {
                    formatData.coord.push(data[i][k]);
                  } else {
                    formatData[j] = data[i][k];
                  }
                }
              }
            }
            let resultData = {};
            for (let i in formatData) {
              resultData[i] = formatData[i];
            }
            formatData.coord = [];
            payload.push(resultData);
          }
        }
        console.log(payload);
        return payload;
      })
      .then(payload => {
        //сортировка данных по уделению от дефолтной точки(аэропорта)
        for (let i = 0; i < payload.length; ++i) {
          for (let j = i + 1; j < payload.length; ++j) {
            let temp = payload[i];
            if (
              this.distanseBetweenTwoPoints(this.airportCoord, payload[i].coord) >
              this.distanseBetweenTwoPoints(this.airportCoord, payload[j].coord)
            ) {
              payload[i] = payload[j];
              payload[j] = temp;
            }
          }
        }

        this.fillingTable(payload);
        setTimeout(() => this.getData(this.url), 5000);
      });
  }

  fillingTable(data) {
    this.tableBody.innerHTML = '';
    for (let i in data) {
      let tr = document.createElement('tr');
      this.tableBody.appendChild(this.fillingRow(data[i], tr));
    }
  }

  fillingRow(data, rowElement) {
    for (let i in data) {
      let td = document.createElement('td');
      td.innerHTML = typeof data[i] === 'object' ? data[i].join('; ') : data[i];
      rowElement.appendChild(td);
    }
    return rowElement;
  }

  distanseBetweenTwoPoints(firstPoint, secondPoint) {
    const R = 6371;
    const lon1 = firstPoint[1];
    const lat1 = firstPoint[0];
    const lon2 = secondPoint[1];
    const lat2 = secondPoint[0];

    const x1 = lat2 - lat1;
    const dLat = this.toRad(x1);
    const x2 = lon2 - lon1;
    const dLon = this.toRad(x2);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    return d;
  }

  toRad(x) {
    return (x * Math.PI) / 180;
  }
}

window.onload = () => {
  const app = new AppTableAirCraft(url, airportCoord, tableBody);
  app.getData(url);
};
