//DrawableCanvas.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import CanvasToolbar from "./CanvasToolbar";
import { useCanvasState } from "./DrawableCanvasState";
import { tools, FabricTool } from "./lib";
import { useCanvasStore } from "./useCanvasStore";
import {
  downloadCallback,
  downloadCallback4Json,
  logCanvasData,
  save2Storage,
} from "../helpers";

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

  // Save the current drawing to localStorage whenever the canvas state changes
  useEffect(() => {
    if (canvasInstance.current) {
      const saveToLocalStorage = () => {
        const canvasData = canvasInstance.current
          ? canvasInstance.current.toJSON()
          : null;
        if (canvasData) {
          localStorage.setItem(
            `canvasDrawing-${index}`,
            JSON.stringify(canvasData)
          );
          console.log(
            `Canvas data saved to localStorage for index ${index}:`,
            canvasData
          );
        }
      };

      canvasInstance.current.on("object:added", saveToLocalStorage);
      canvasInstance.current.on("object:modified", saveToLocalStorage);
      canvasInstance.current.on("object:removed", saveToLocalStorage);

      return () => {
        canvasInstance.current?.off("object:added", saveToLocalStorage);
        canvasInstance.current?.off("object:modified", saveToLocalStorage);
        canvasInstance.current?.off("object:removed", saveToLocalStorage);
      };
    }
  }, [canvasInstance.current, index]); // Monitor the index for changes

  // Load the drawing from localStorage when the component mounts
  useEffect(() => {
    if (canvasInstance.current) {
      const savedDrawing = localStorage.getItem(`canvasDrawing-${index}`);
      if (savedDrawing) {
        const parsedDrawing = JSON.parse(savedDrawing);
        if (canvasRef.current) {
          // Ensure the canvas is properly loaded from localStorage.
          canvasInstance.current?.loadFromJSON(parsedDrawing, () => {
            canvasInstance.current?.renderAll();
          });
          console.log(
            `Canvas data loaded from localStorage for index ${index}:`,
            savedDrawing
          );
        }
      }
    }
  }, [canvasInstance.current, index]); // Load the drawing whenever the `index` changes

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
            downloadCallback2={downloadCallback4Json}
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
