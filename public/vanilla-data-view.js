let regionsContainer;
let vehiclesContainer;
let resultDisplay;
let dataStatus;

let trafficData = [];
let regionCheckboxes = {};
let vehicleCheckboxes = {};
let uniqueRegions = [];
let uniqueVehicleTypes = [];

document.addEventListener("DOMContentLoaded", function () {
  regionsContainer = document.getElementById("regionsContainer");
  vehiclesContainer = document.getElementById("vehiclesContainer");
  resultDisplay = document.getElementById("results");
  dataStatus = document.createElement("div");
  dataStatus.className = "status";
  document
    .querySelector(".container")
    .insertBefore(dataStatus, document.querySelector(".selection-section"));

  loadCSVData();
});

async function loadCSVData() {
  try {
    dataStatus.textContent = "Loading traffic data...";
    const response = await fetch("/data/occupancy_analysis.csv");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    processCSVData(csvText);
  } catch (error) {
    console.error("Error loading CSV:", error);
    dataStatus.textContent = `Error loading data: ${error.message}. Make sure occupancy_analysis.csv is in the public/data directory.`;
  }
}

function processCSVData(csvText) {
  try {
    trafficData = [];
    const lines = csvText.split("\n");
    const headers = parseCSVLine(lines[0]);

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === "") continue;

      const values = parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index];
        });
        trafficData.push(row);
      }
    }

    extractUniqueValues();
    populateCheckboxes();

    dataStatus.textContent = `Successfully loaded ${trafficData.length} records`;
  } catch (error) {
    console.error("Error processing CSV:", error);
    dataStatus.textContent = `Error processing data: ${error.message}`;
  }
}

function parseCSVLine(line) {
  const values = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        currentValue += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = "";
    } else {
      currentValue += char;
    }
  }

  values.push(currentValue.trim());
  return values;
}

function extractUniqueValues() {
  const regionSet = new Set();
  const vehicleSet = new Set();

  trafficData.forEach((row) => {
    if (
      row["Detection Group"] &&
      !row["Detection Group"].includes("Detection")
    ) {
      regionSet.add(row["Detection Group"].trim());
    }
    if (row["Vehicle Class"] && !row["Vehicle Class"].includes("Vehicle")) {
      vehicleSet.add(row["Vehicle Class"].trim());
    }
  });

  uniqueRegions = Array.from(regionSet).sort();
  uniqueVehicleTypes = Array.from(vehicleSet).sort();
}

function populateCheckboxes() {
  regionsContainer.innerHTML = "";
  uniqueRegions.forEach((region) => {
    const label = document.createElement("label");
    label.className = "checkbox-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = region;
    checkbox.id = `region-${region}`;
    checkbox.className = "checkbox-input";

    regionCheckboxes[region] = checkbox;

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(region));
    regionsContainer.appendChild(label);
  });

  vehiclesContainer.innerHTML = "";
  uniqueVehicleTypes.forEach((vehicle) => {
    const label = document.createElement("label");
    label.className = "checkbox-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = vehicle;
    checkbox.id = `vehicle-${vehicle}`;
    checkbox.className = "checkbox-input";

    vehicleCheckboxes[vehicle] = checkbox;

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(vehicle));
    vehiclesContainer.appendChild(label);
  });
}

function setAllCheckboxes(type, checked) {
  const checkboxes = type === "region" ? regionCheckboxes : vehicleCheckboxes;
  Object.values(checkboxes).forEach((checkbox) => {
    checkbox.checked = checked;
  });
}

function calculateAverage(data, field) {
  const validValues = data
    .map((row) => parseFloat(row[field]))
    .filter((value) => !isNaN(value));

  if (validValues.length === 0) return 0;

  return (
    validValues.reduce((sum, value) => sum + value, 0) / validValues.length
  );
}

function getCurrentTimeInfo() {
  const now = new Date();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return {
    dayOfWeek: days[now.getDay()],
    hour: now.getHours(),
    minute: now.getMinutes(),
    minuteBlock: Math.floor(now.getMinutes() / 10) * 10,
  };
}

function createCircularProgress(percentage, label) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - percentage) / 100) * circumference;

  const container = document.createElement("div");
  container.className = "circular-progress";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "150");
  svg.setAttribute("height", "150");
  svg.setAttribute("viewBox", "0 0 150 150");

  const bgCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  bgCircle.setAttribute("cx", "75");
  bgCircle.setAttribute("cy", "75");
  bgCircle.setAttribute("r", radius);
  bgCircle.setAttribute("fill", "none");
  bgCircle.setAttribute("stroke", "#2d2d2d");
  bgCircle.setAttribute("stroke-width", "10");

  const emptyCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  emptyCircle.setAttribute("cx", "75");
  emptyCircle.setAttribute("cy", "75");
  emptyCircle.setAttribute("r", radius);
  emptyCircle.setAttribute("fill", "none");
  emptyCircle.setAttribute("stroke", "#404040");
  emptyCircle.setAttribute("stroke-width", "10");
  emptyCircle.setAttribute("transform", "rotate(180, 75, 75)");

  const progressCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  progressCircle.setAttribute("cx", "75");
  progressCircle.setAttribute("cy", "75");
  progressCircle.setAttribute("r", radius);
  progressCircle.setAttribute("fill", "none");
  progressCircle.setAttribute("stroke", "#6200ea");
  progressCircle.setAttribute("stroke-width", "10");
  progressCircle.setAttribute("stroke-dasharray", circumference);
  progressCircle.setAttribute("stroke-dashoffset", progress);
  progressCircle.setAttribute("transform", "rotate(180, 75, 75)");

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", "75");
  text.setAttribute("y", "65");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("fill", "#ffffff");
  text.setAttribute("font-size", "36");
  text.textContent = `${Math.round(percentage)}%`;

  const labelText = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  labelText.setAttribute("x", "75");
  labelText.setAttribute("y", "95");
  labelText.setAttribute("text-anchor", "middle");
  labelText.setAttribute("fill", "#999999");
  labelText.setAttribute("font-size", "24");
  labelText.textContent = "percentile";

  svg.appendChild(bgCircle);
  svg.appendChild(emptyCircle);
  svg.appendChild(progressCircle);
  svg.appendChild(text);
  svg.appendChild(labelText);

  const titleDiv = document.createElement("div");
  titleDiv.className = "panel-title";
  titleDiv.textContent = label;

  const descriptionDiv = document.createElement("div");
  descriptionDiv.className = "crowding-description";

  let crowdingLevel = "";
  let textColor = "";

  const isInflow = label.toLowerCase().includes("inflow");

  if (percentage > 90) {
    crowdingLevel = isInflow ? "extremely congested" : "extremely crowded";
    textColor = "#ff1744";
  } else if (percentage > 70) {
    crowdingLevel = isInflow ? "very congested" : "very crowded";
    textColor = "#ff4081";
  } else if (percentage > 55) {
    crowdingLevel = isInflow ? "congested" : "crowded";
    textColor = "#ff9100";
  } else if (percentage > 45) {
    crowdingLevel = "average";
    textColor = "#ffeb3b";
  } else if (percentage > 25) {
    crowdingLevel = isInflow ? "not congested" : "not crowded";
    textColor = "#00e676";
  } else {
    crowdingLevel = isInflow ? "very not congested" : "very not crowded";
    textColor = "#00c853";
  }

  descriptionDiv.textContent = crowdingLevel;
  descriptionDiv.style.color = textColor;

  container.appendChild(titleDiv);
  container.appendChild(svg);
  container.appendChild(descriptionDiv);

  return container;
}

function calculateEstimate() {
  const timeInfo = getCurrentTimeInfo();

  const selectedRegions = Object.entries(regionCheckboxes)
    .filter(([_, checkbox]) => checkbox.checked)
    .map(([region]) => region);

  const selectedVehicles = Object.entries(vehicleCheckboxes)
    .filter(([_, checkbox]) => checkbox.checked)
    .map(([vehicle]) => vehicle);

  const resultsCard = document.createElement("div");
  resultsCard.className = "results-card";

  if (selectedRegions.length === 0 || selectedVehicles.length === 0) {
    resultsCard.innerHTML = `
      <div class="error-message">
        <h3>Error:</h3>
        <p>Please select at least one region and one vehicle type.</p>
      </div>
    `;
    resultDisplay.innerHTML = "";
    resultDisplay.appendChild(resultsCard);
    return;
  }

  const detectionColumn = "Detection Group";
  const vehicleColumn = "Vehicle Class";

  let filteredData = trafficData.filter(
    (row) =>
      selectedRegions.includes(row[detectionColumn]) &&
      selectedVehicles.includes(row[vehicleColumn]) &&
      row["Day of Week"] === timeInfo.dayOfWeek &&
      parseInt(row["Hour of Day"]) === timeInfo.hour &&
      parseInt(row["Minute of Hour"]) === timeInfo.minuteBlock
  );

  if (filteredData.length > 0) {
    const avgInflow = calculateAverage(filteredData, "CRZ Entries");
    const avgOccupancy = calculateAverage(filteredData, "estimated_occupancy");

    const historicalData = trafficData.filter(
      (row) =>
        selectedRegions.includes(row[detectionColumn]) &&
        selectedVehicles.includes(row[vehicleColumn]) &&
        row["Day of Week"] === timeInfo.dayOfWeek &&
        parseInt(row["Hour of Day"]) === timeInfo.hour
    );

    const historicalInflows = historicalData
      .map((row) => parseFloat(row["CRZ Entries"]))
      .filter((value) => !isNaN(value))
      .sort((a, b) => a - b);

    const historicalOccupancies = historicalData
      .map((row) => parseFloat(row["estimated_occupancy"]))
      .filter((value) => !isNaN(value))
      .sort((a, b) => a - b);

    const inflowPercentile =
      (historicalInflows.filter((value) => value <= avgInflow).length /
        historicalInflows.length) *
      100;

    const occupancyPercentile =
      (historicalOccupancies.filter((value) => value <= avgOccupancy).length /
        historicalOccupancies.length) *
      100;

    const dashboard = document.createElement("div");
    dashboard.className = "dashboard";

    const timePanel = document.createElement("div");
    timePanel.className = "dashboard-panel";
    timePanel.innerHTML = `
      <div class="panel-title">Current Timeframe</div>
      <div class="time-info">
        <div class="time-item">
          <span class="label">Day</span>
          <span class="value">${timeInfo.dayOfWeek}</span>
        </div>
        <div class="time-item">
          <span class="label">Hour</span>
          <span class="value">${timeInfo.hour}:${timeInfo.minuteBlock
      .toString()
      .padStart(2, "0")}</span>
        </div>
      </div>
    `;

    const inflowPanel = document.createElement("div");
    inflowPanel.className = "dashboard-panel";
    inflowPanel.appendChild(
      createCircularProgress(inflowPercentile, "Zone Inflow Percentile")
    );

    const occupancyPanel = document.createElement("div");
    occupancyPanel.className = "dashboard-panel";
    occupancyPanel.appendChild(
      createCircularProgress(occupancyPercentile, "Zone Occupancy Percentile")
    );

    const predictionsPanel = document.createElement("div");
    predictionsPanel.className = "dashboard-panel";
    predictionsPanel.innerHTML = `
      <div class="panel-title">Current Predictions</div>
      <div class="prediction-item">
        <span class="label">Inflow Rate</span>
        <span class="value">${avgInflow.toFixed(1)}</span>
        <span class="unit">vehicles/min</span>
      </div>

      <div class="prediction-item">
        <span class="label">Occupancy</span>
        <span class="value">${avgOccupancy.toFixed(0)}</span>
        <span class="unit">vehicles</span>
      </div>
    `;

    dashboard.appendChild(timePanel);
    dashboard.appendChild(inflowPanel);
    dashboard.appendChild(occupancyPanel);
    dashboard.appendChild(predictionsPanel);

    resultsCard.appendChild(dashboard);
  } else {
    resultsCard.innerHTML = `
      <div class="error-message">
        <h3>No Data Available:</h3>
        <p>No matching historical records found.</p>
        <p>Try selecting different regions or vehicle types.</p>
      </div>
    `;
  }

  resultDisplay.innerHTML = "";
  resultDisplay.appendChild(resultsCard);
}

function addStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .checkbox-input {
      flex-shrink: 0;
      margin-right: 6px;
      width: 14px;
      height: 14px;
    }

    .dashboard {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      padding: 20px;
      background-color: #1e1e1e;
      border-radius: 8px;
      margin-bottom: 20px;
      width: 100%;
    }

    .dashboard-panel {
      background-color: #2d2d2d;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 220px;
      overflow: hidden;
    }

    .panel-title {
      font-size: 1.1em;
      color: rgba(255, 255, 255, 0.87);
      margin-bottom: 8px;
      text-align: center;
      font-weight: 500;
      letter-spacing: 0.5px;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .time-info {
      display: flex;
      flex-direction: column;
      gap: 20px;
      width: 100%;
      flex-grow: 1;
      justify-content: center;
      margin-top: 8px;
    }

    .time-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .time-item .label,
    .prediction-item .label {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9em;
      font-weight: 400;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .time-item .value,
    .prediction-item .value {
      color: rgba(255, 255, 255, 0.87);
      font-size: 1.5em;
      font-weight: 500;
      line-height: 1.2;
    }

    .predictions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      height: 100%;
      margin-top: 8px;
    }

    .prediction-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      text-align: center;
      margin-bottom: 15px;
    }

    .prediction-item:last-child {
      margin-bottom: 0;
    }

    .prediction-item .unit {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.8em;
      font-weight: 400;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: -2px;
    }

    .circular-progress {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      justify-content: flex-start;
      gap: 8px;
    }

    .circular-progress svg {
      width: 120px;
      height: 120px;
    }

    .circular-progress text {
      font-family: Arial, sans-serif;
      font-weight: 500;
    }

    .crowding-description {
      text-align: center;
      margin-top: 4px;
      font-size: 1.1em;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status {
      margin: 8px 0;
      padding: 10px;
      background-color: #2d2d2d;
      border-radius: 4px;
      color: rgba(255, 255, 255, 0.6);
    }

    .results-card {
      background-color: #1e1e1e;
      padding: 20px;
      border-radius: 8px;
      margin-top: 15px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  `;
  document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", addStyles);
