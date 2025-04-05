
# MTA Congestion Relief Zone Vehicle Entries - Data Dictionary

This dataset provides information on vehicle entries into the Congestion Relief Zone (CRZ) in New York City, including time-based features, vehicle classification, and entry counts. It supports analysis of traffic patterns and congestion mitigation efforts.

---

## 📅 Time-related Fields

| Column Name             | Type       | Description |
|------------------------|------------|-------------|
| `Toll Date`            | DATE       | The date of the vehicle entry (MM/DD/YYYY). |
| `Toll Hour`            | TIMESTAMP  | Timestamp representing the hour (rounded to 0 minutes) of the vehicle entry. |
| `Toll 10 Minute Block` | TIMESTAMP  | Timestamp representing the start of the 10-minute block for the vehicle entry. |
| `Minute of Hour`       | NUMERIC    | Starting minute of the 10-minute block (e.g., 0, 10, 20, etc.). |
| `Hour of Day`          | NUMERIC    | Hour of the day as an integer (e.g., 13 for 1 PM). |
| `Day of Week Int`      | NUMERIC    | Integer for day of week: 1 = Sunday, ..., 7 = Saturday. |
| `Day of Week`          | TEXT       | Day of the week in plain text (e.g., Monday). |
| `Toll Week`            | DATE       | The Sunday corresponding to the `Toll Date`, defining the week's data. |

---

## 🕒 Toll Schedule

| Column Name    | Type | Description |
|----------------|------|-------------|
| `Time Period`  | TEXT | Indicates toll category for that hour (`Peak` or `Overnight`). Schedule varies for weekdays and weekends. See [MTA Tolling Schedule](https://congestionreliefzone.mta.info/). |

---

## 🚗 Vehicle Information

| Column Name     | Type | Description |
|------------------|------|-------------|
| `Vehicle Class`  | TEXT | Detected category of vehicle: <br>1 - Cars, Pickups, Vans (not including TLC Taxi/FHV) <br>2 - Single-Unit Trucks <br>3 - Multi-Unit Trucks <br>4 - Buses <br>5 - Motorcycles <br>TLC Taxi/FHV (if tolled outside PTCP plan). |

---

## 🌉 Entry Location

| Column Name       | Type | Description |
|-------------------|------|-------------|
| `Detection Group` | TEXT | The specific crossing where the entry was first detected. |
| `Detection Region`| TEXT | Region associated with the crossing (e.g., Williamsburg Bridge → Brooklyn). |

---

## 🚦 Entry Counts

| Column Name              | Type    | Description |
|--------------------------|---------|-------------|
| `CRZ Entries`            | NUMERIC | Number of vehicle entries that entered the CRZ (excluding those only on excluded roadways). |
| `Excluded Roadway Entries` | NUMERIC | Number of vehicle entries that stayed on excluded roadways within the CBD. |
