//DrawableCanvas.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import CanvasToolbar from "./CanvasToolbar";
import { useCanvasState } from "./DrawableCanvasState";
import { tools, FabricTool } from "./lib";
import { useCanvasStore } from "./useCanvasStore";

export interface ComponentArgs {
  index: number;
  fillColor: string;
  strokeWidth: number;
  strokeColor: string;
  backgroundColor: string;
  backgroundImageURL: string;
  canvasWidth: number;
  canvasHeight: number;
  drawingMode: string;
  initialDrawing: Object;
  displayToolbar: boolean;
  displayRadius: number;
  scaleFactors: number[];
}

const DrawableCanvas = ({
  index,
  fillColor,
  strokeWidth,
  strokeColor,
  backgroundColor,
  backgroundImageURL,
  canvasWidth,
  canvasHeight,
  drawingMode,
  initialDrawing,
  displayToolbar,
  displayRadius,
  scaleFactors,
}: ComponentArgs) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstance = useRef<fabric.Canvas | null>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasInstance = useRef<fabric.StaticCanvas | null>(null);
  const {
    canvasState: {
      action: { shouldReloadCanvas },
      currentState,
      initialState,
    },
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetState,
  } = useCanvasState();

  const setCurrentState = useCanvasStore(
    (state: { setCurrentState: (state: any) => void }) => state.setCurrentState
  );

  // useEffect(() => {
  //   setCurrentState(currentState);
  // }, [currentState, setCurrentState]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasInstance.current = new fabric.Canvas(canvasRef.current, {
        enableRetinaScaling: false,
      });

      // Load initial drawing only once
      canvasInstance.current.loadFromJSON(initialDrawing, () => {
        canvasInstance.current?.renderAll();
        resetState(initialDrawing);
      });
    }

    if (backgroundCanvasRef.current) {
      backgroundCanvasInstance.current = new fabric.StaticCanvas(
        backgroundCanvasRef.current,
        {
          enableRetinaScaling: false,
        }
      );

      // Add static rectangle to background canvas
      const rect = new fabric.Rect({
        left: 75,
        top: 25,
        fill: "white",
        width: canvasWidth - 100, //100
        height: canvasHeight - 100, //100,
        stroke: "black", // Border color
        strokeWidth: 1, // Border width
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        hasControls: false,
      });
      backgroundCanvasInstance.current.add(rect);
      backgroundCanvasInstance.current.renderAll();
    }

    // Disable context menu on right-click
    const canvasElement = canvasRef.current;
    if (canvasElement) {
      canvasElement.addEventListener("contextmenu", (e) => {
        e.preventDefault();
      });
    }

    return () => {
      if (canvasElement) {
        canvasElement.removeEventListener("contextmenu", (e) => {
          e.preventDefault();
        });
      }
      canvasInstance.current?.dispose();
      backgroundCanvasInstance.current?.dispose();
    };
  }, [resetState]);

  useEffect(() => {
    if (backgroundCanvasInstance.current && backgroundImageURL) {
      const bgImage = new Image();
      bgImage.onload = function () {
        backgroundCanvasInstance.current?.getContext().drawImage(bgImage, 0, 0);
      };
      bgImage.src = backgroundImageURL;
    }
  }, [backgroundImageURL]);

  useEffect(() => {
    if (canvasInstance.current && shouldReloadCanvas) {
      canvasInstance.current.loadFromJSON(currentState, () => {
        canvasInstance.current?.renderAll();
      });
    }
  }, [shouldReloadCanvas, currentState]);

  useEffect(() => {
    if (canvasInstance.current) {
      const selectedTool = new tools[drawingMode](
        canvasInstance.current
      ) as FabricTool;
      const cleanupToolEvents = selectedTool.configureCanvas({
        fillColor: fillColor,
        strokeWidth: strokeWidth,
        strokeColor: strokeColor,
        displayRadius: displayRadius,
        scaleFactors: scaleFactors,
        canvasHeight: canvasHeight,
        canvasWidth: canvasWidth,
      });

      const handleMouseUp = () => {
        const canvasJSON = canvasInstance.current?.toJSON();
        if (canvasJSON) {
          saveState(canvasJSON);
          //console.log("canvasJSON", canvasJSON);
          //setCurrentState(currentState);
        }
      };

      canvasInstance.current.on("mouse:up", handleMouseUp);
      canvasInstance.current.on("mouse:dblclick", handleMouseUp);

      return () => {
        cleanupToolEvents();
        canvasInstance.current?.off("mouse:up", handleMouseUp);
        canvasInstance.current?.off("mouse:dblclick", handleMouseUp);
      };
    }
  }, [
    strokeWidth,
    strokeColor,
    displayRadius,
    fillColor,
    drawingMode,
    scaleFactors,
    canvasHeight,
    canvasWidth,
    saveState,
  ]);

  const downloadCallback = () => {
    if (canvasInstance.current && backgroundCanvasInstance.current) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvasWidth;
      tempCanvas.height = canvasHeight;
      const tempContext = tempCanvas.getContext("2d");

      if (tempContext) {
        // Draw background canvas onto temp canvas
        if (backgroundCanvasRef.current) {
          tempContext.drawImage(backgroundCanvasRef.current, 0, 0);
        }

        if (canvasRef.current) {
          tempContext.drawImage(canvasRef.current, 0, 0);
        }

        // Export temp canvas as image
        const dataURL = tempCanvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "canvas.png";
        link.click();
      }
    }
  };

  const downloadCallback2 = () => {
    if (canvasInstance.current && backgroundCanvasInstance.current) {
      const canvasData = [];

      // Collect background canvas data if needed (assuming backgroundCanvasRef contains objects or path data)
      if (backgroundCanvasRef.current) {
        // Add your logic to extract background drawing data from the background canvas
        // For example, you might use canvasInstance's `toJSON()` or any specific method for extracting the data
        const backgroundData = backgroundCanvasInstance.current.toJSON(); // assuming using fabric.js or similar
        canvasData.push({ background: backgroundData });
      }

      // Collect main canvas data
      if (canvasRef.current) {
        // Assuming canvasInstance is the main drawing canvas, and you want to export its data
        const mainCanvasData = canvasInstance.current.toJSON(); // Example if using fabric.js
        canvasData.push({ mainCanvas: mainCanvasData });
      }

      //// Convert the canvas data to JSON
      const jsonBlob = new Blob([JSON.stringify(canvasData)], {
        type: "application/json",
      });
      //// Create a link element to trigger the download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(jsonBlob);
      link.download = "canvasData.json";
      link.click();
    }
  };

  const logCanvasData = () => {
    if (canvasInstance.current && backgroundCanvasInstance.current) {
      const canvasData = [];

      // Collect background canvas data if needed
      if (backgroundCanvasInstance.current) {
        const backgroundData = backgroundCanvasInstance.current.toJSON(); // Assuming Fabric.js
        canvasData.push({ background: backgroundData });
      }

      // Collect main canvas data
      if (canvasInstance.current) {
        const mainCanvasData = canvasInstance.current.toJSON(); // Assuming Fabric.js
        canvasData.push({ mainCanvas: mainCanvasData });
      }

      //// Log the canvas data to the console
      // console.log( "Combined Canvas Data in DrawableCanvas.tsx:",         JSON.stringify(canvasData, null, 2)      );
    } else {
      console.error("Canvas instances not found.");
    }
  };

  const save2Storage = () => {
    if (canvasInstance.current && backgroundCanvasInstance.current) {
      const canvasData = [];

      // Collect background canvas data if needed
      if (backgroundCanvasInstance.current) {
        const backgroundData = backgroundCanvasInstance.current.toJSON(); // Assuming Fabric.js
        canvasData.push({ background: backgroundData });
      }

      // Collect main canvas data
      if (canvasInstance.current) {
        const mainCanvasData = canvasInstance.current.toJSON(); // Assuming Fabric.js
        canvasData.push({ mainCanvas: mainCanvasData });
      }

      // Save the canvas data to localStorage
      try {
        //localStorage.setItem("canvasData", JSON.stringify(canvasData));
        setCurrentState(canvasData);
        console.log(
          "Canvas data saved to localStorage and/or currentState in DrawableCanvas.tsx: ",
          canvasData
        );
      } catch (e) {
        console.error("Error saving canvas data to localStorage:", e);
      }
    } else {
      console.error("Canvas instances not found.");
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
          backgroundColor: "rgba(255, 0, 0, 0.1)",
        }}
      >
        <canvas
          id={`backgroundimage-canvas-${index}`}
          ref={backgroundCanvasRef}
          width={canvasWidth}
          height={canvasHeight}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 10,
          border: "1px solid black",
        }}
      >
        <canvas
          id={`canvas-${index}`}
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="border border-lightgrey"
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        {displayToolbar && (
          <CanvasToolbar
            topPosition={0}
            leftPosition={canvasWidth + 5}
            downloadCallback={downloadCallback}
            downloadCallback2={downloadCallback2}
            //downloadCallback3={logCanvasData}
            downloadCallback3={save2Storage}
            canUndo={canUndo}
            canRedo={canRedo}
            undoCallback={undo}
            redoCallback={redo}
            resetCallback={() => {
              resetState(initialState);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DrawableCanvas;