"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

import * as THREE from "three";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState } from "react";
import geojson_data from "./map.json";
import * as d3 from "d3";

const locations = [
  "Brooklyn Bridge",
  "Williamsburg Bridge",
  "Manhattan Bridge",
  "Hugh L. Carey Tunnel",
  "East 60th St",
  "FDR Drive at 60th St",
  "Lincoln Tunnel",
  "Holland Tunnel",
  "Queensboro Bridge",
  "Queens Midtown Tunnel",
  "West 60th St",
  "West Side Highway at 60th St",
];

/*
Index(['Toll Date', 'Toll Hour', 'Toll 10 Minute Block', 'Minute of Hour',
       'Hour of Day', 'Day of Week Int', 'Day of Week', 'Toll Week',
       'Time Period', 'Vehicle Class', 'Detection Group', 'Detection Region',
       'CRZ Entries', 'Excluded Roadway Entries'],
      dtype='object')
*/

const cylinders = {
  "West 60th St": {
    lng: -73.987,
    lat: 40.7711,
  },
  "West Side Highway at 60th St": {
    lng: -73.9931,
    lat: 40.7735,
  },
  "Lincoln Tunnel": {
    lng: -74.0036,
    lat: 40.7606,
  },
  "Holland Tunnel": {
    lng: -74.0127,
    lat: 40.7264,
  },
  "Hugh L. Carey Tunnel": {
    lng: -74.0153,
    lat: 40.7006,
  },
  "Brooklyn Bridge": {
    lng: -73.9989,
    lat: 40.708,
  },
  "Manhattan Bridge": {
    lng: -73.9916,
    lat: 40.7094,
  },
  "Williamsburg Bridge": {
    lng: -73.975,
    lat: 40.7146,
  },
  "Queens Midtown Tunnel": {
    lng: -73.9679,
    lat: 40.7476,
  },
  "Queensboro Bridge": {
    lng: -73.9664,
    lat: 40.7617,
  },
  "FDR Drive at 60th St": {
    lng: -73.9587,
    lat: 40.7588,
  },
  "East 60th St": {
    lng: -73.9567,
    lat: 40.7578,
  },
};

const DateTimeSlider = ({ setDate }) => {
  // Start and end dates
  const startDate = new Date("2025-01-05 12:00:00 AM");
  const endDate = new Date("2025-03-29 11:50:00 PM");

  // Calculate number of 10-minute steps
  const stepMillis = 10 * 60 * 1000;
  const totalSteps = Math.floor((endDate - startDate) / stepMillis);

  const [step, setStep] = useState(0);

  // Calculate current date based on step
  const currentDate = new Date(startDate.getTime() + step * stepMillis);

  const formatDate = (date) => {
    return date
      .toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      .replace(",", "");
  };

  const handleChange = (e) => {
    setStep(e.target.value);
    const currentDate = new Date(startDate.getTime() + step * stepMillis);
    setDate(formatDate(currentDate));
  };

  return (
    <div
      style={{
        width: "400px",
        margin: "0 auto",
        position: "absolute",
        bottom: "10px",
        right: "10px",
        zIndex: 2,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: "1rem",
        borderRadius: "0.5rem",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <input
        type="range"
        min="0"
        max={totalSteps}
        step="1"
        value={step}
        onChange={handleChange}
        style={{
          width: "100%",
          height: "4px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "2px",
          outline: "none",
          WebkitAppearance: "none",
        }}
      />
      <p style={{
        textAlign: "center",
        marginTop: "10px",
        color: "white",
        fontSize: "0.875rem",
        fontWeight: "500"
      }}>
        {formatDate(currentDate)}
      </p>
    </div>
  );
};

export const NYCMap = ({ showUI }) => {
  const [csvData, setCsvData] = useState(null);
  const [date, setDate] = useState("03/29/2025 11:50:00 PM");
  useEffect(() => {
    d3.csv("data_agg.csv").then((data) => {
      setCsvData(data);
    });
  }, []);

  const [shown, setShown] = useState(new Set(locations));
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const cameraRef = useRef({
    center: [-73.987, 40.7711],
    zoom: 12,
    pitch: 40,
  });

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiZnJhbmdrbGkiLCJhIjoiY205M2R3bHR3MG43cjJqb2h2MGZteXk0YyJ9.sxMvbKWU-qkgbjpeqCK2_w";

    mapRef.current = new mapboxgl.Map({
      container: "map",
      // center: [-74.006292, 40.712666],
      center: cameraRef.current.center,
      projection: "globe",
      zoom: cameraRef.current.zoom,
      pitch: cameraRef.current.pitch,
      style: "mapbox://styles/frangkli/cm93fa1vn008l01qu66m7c4g0",
      antialias: true,
      // style: "mapbox://styles/mapbox/dark-v11",
    });

    // Save camera state on move
    mapRef.current.on("style.load", () => {
      mapRef.current.on("moveend", () => {
        const { lng, lat } = mapRef.current.getCenter();
        cameraRef.current = {
          center: [lng, lat],
          zoom: mapRef.current.getZoom(),
          bearing: mapRef.current.getBearing(),
          pitch: mapRef.current.getPitch(),
        };
      });

      mapRef.current.addSource("city", {
        type: "geojson",
        data: geojson_data,
      });
      mapRef.current.addLayer({
        id: "city-layer",
        type: "fill",
        source: "city",
        layout: {},
        paint: {
          "fill-color": "white",
          "fill-opacity": 0.5,
        },
      });
      mapRef.current.addLayer({
        id: "city-line",
        type: "line",
        source: "city",
        layout: {},
        paint: {
          "line-width": 4,
          "line-color": "white",
        },
      });
      mapRef.current.addLayer({
        id: "highlight",
        type: "fill",
        source: "city",
        paint: {
          "fill-color": "red",
          "fill-opacity": 1,
        },
        filter: ["==", "circle_id", ""],
      });
    });
    Object.keys(cylinders).forEach((key) => {
      const data = cylinders[key];
      // parameters to ensure the model is georeferenced correctly on the map
      const modelOrigin = [data.lng, data.lat];
      const modelAltitude = 0;
      const modelRotate = [Math.PI / 2, 0, 0];

      const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
      );

      // transformation parameters to position, rotate and scale the 3D model onto the map
      const modelTransform = {
        translateX: modelAsMercatorCoordinate.x,
        translateY: modelAsMercatorCoordinate.y,
        translateZ: modelAsMercatorCoordinate.z,
        rotateX: modelRotate[0],
        rotateY: modelRotate[1],
        rotateZ: modelRotate[2],
        /* Since the 3D model is in real world meters, a scale transform needs to be
         * applied since the CustomLayerInterface expects units in MercatorCoordinates.
         */
        scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
      };

      const customLayer = {
        id: "3d-model-" + key,
        type: "custom",
        renderingMode: "3d",
        onAdd: function (map, gl) {
          this.camera = new THREE.Camera();
          this.scene = new THREE.Scene();

          // create two three.js lights to illuminate the model
          const directionalLight = new THREE.DirectionalLight(0xffffff);
          directionalLight.position.set(0, -70, 100).normalize();
          this.scene.add(directionalLight);

          const directionalLight2 = new THREE.DirectionalLight(0xffffff);
          directionalLight2.position.set(0, 70, 100).normalize();
          this.scene.add(directionalLight2);

          const scale = 1;
          const material = new THREE.MeshStandardMaterial({
            color: 0x3355ff,
          });

          const height = csvData
            .filter(
              (d) =>
                d["Detection Group"] === key &&
                d["Toll 10 Minute Block"] === date
            )
            .map((d) => +d["CRZ Entries"])
            .filter((d) => !isNaN(d));
          const geometry = new THREE.CylinderGeometry(
            200 * scale,
            200 * scale,
            height,
            100
          );
          const mesh = new THREE.Mesh(geometry, material);

          mesh.scale.set(1, 1, 1);
          this.scene.add(mesh);

          this.map = mapRef.current;

          // use the Mapbox GL JS map canvas for three.js
          this.renderer = new THREE.WebGLRenderer({
            canvas: mapRef.current.getCanvas(),
            context: gl,
            antialias: true,
          });

          this.renderer.autoClear = false;
        },
        render: function (gl, matrix) {
          const rotationX = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(1, 0, 0),
            modelTransform.rotateX
          );
          const rotationY = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 1, 0),
            modelTransform.rotateY
          );
          const rotationZ = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 0, 1),
            modelTransform.rotateZ
          );

          const m = new THREE.Matrix4().fromArray(matrix);
          const l = new THREE.Matrix4()
            .makeTranslation(
              modelTransform.translateX,
              modelTransform.translateY,
              modelTransform.translateZ
            )
            .scale(
              new THREE.Vector3(
                modelTransform.scale,
                -modelTransform.scale,
                modelTransform.scale
              )
            )
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

          this.camera.projectionMatrix = m.multiply(l);
          this.renderer.resetState();
          this.renderer.render(this.scene, this.camera);
          this.map.triggerRepaint();
        },
      };
      mapRef.current.on("style.load", () => {
        mapRef.current.addLayer(customLayer);
      });
    });
  }, [cylinders, csvData, date]);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      {showUI && <DateTimeSlider setDate={setDate} />}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          zIndex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: "1rem",
          borderRadius: "0.5rem",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          margin: "1rem",
          display: showUI ? "block" : "none",
        }}
      >
        {locations.map((location) => (
          <div key={location} style={{
            padding: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "white",
            fontSize: "0.875rem"
          }}>
            <input
              type="checkbox"
              checked={shown.has(location)}
              onChange={(e) => {
                const newShown = new Set(shown);
                if (e.target.checked) {
                  mapRef.current.setLayoutProperty(
                    "3d-model-" + location,
                    "visibility",
                    "visible"
                  );
                  newShown.add(location);
                } else {
                  mapRef.current.setLayoutProperty(
                    "3d-model-" + location,
                    "visibility",
                    "none"
                  );
                  newShown.delete(location);
                }
                setShown(newShown);
              }}
              style={{
                width: "1rem",
                height: "1rem",
                borderRadius: "0.25rem",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backgroundColor: "transparent",
                cursor: "pointer",
                accentColor: "rgb(16, 185, 129)"
              }}
            />
            {location}
          </div>
        ))}
      </div>
      <div id="map" style={{ height: "100vh" }} ref={mapContainerRef} />
    </div>
  );
};
