import { saveAs } from "file-saver";
import { PDFDocument, StandardFonts } from "pdf-lib";

export const handleJsonSave = (e, questions, userAnswers) => {
  e.preventDefault();

  const userInputData = questions.map((question, index) => ({
    ...question,
    "user-answer": userAnswers[index] || "",
  }));

  const json = JSON.stringify(userInputData, null, 2);
  const blob = new Blob([json], { type: "application/json" });

  saveAs(blob, "user-input.json");
};

export const wrapText = (text, font, size, maxWidth) => {
  const words = text.split(" ");
  let lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = font.widthOfTextAtSize(currentLine + " " + word, size);
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
};

export const addNewPage = (pdfDoc, pageWidth, pageHeight) => {
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  return { page, yOffset: pageHeight - 50 };
};

//--------------------------------------------------------------------------------------------
export const handleGeneratePDF = async (
  e,
  questions,
  userAnswers,
  fullname
) => {
  e.preventDefault();

  const userInputData = questions.map((question, index) => ({
    ...question,
    "user-answer": userAnswers[index] || "",
  }));

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const paddingLeft = 20;
  const pageHeight = 800;
  const pageWidth = 600;
  const maxWidth = pageWidth - 2 * paddingLeft;

  let { page, yOffset } = addNewPage(pdfDoc, pageWidth, pageHeight);

  const fullNameLines = wrapText(
    `Full Name: ${fullname}`,
    boldFont,
    14,
    maxWidth
  );
  for (const line of fullNameLines) {
    page.drawText(line, {
      x: paddingLeft,
      y: yOffset,
      size: 14,
      font: boldFont,
    });
    yOffset -= 20;
  }
  yOffset -= 20;

  for (const [index, question] of userInputData.entries()) {
    if (yOffset < 100) {
      ({ page, yOffset } = addNewPage(pdfDoc, pageWidth, pageHeight));
    }

    const questionText = `${index + 1}. ${question.question}`;
    const questionLines = wrapText(questionText, font, 12, maxWidth);
    for (const line of questionLines) {
      page.drawText(line, {
        x: paddingLeft,
        y: yOffset,
        size: 12,
        font: font,
      });
      yOffset -= 20;
    }

    if (question.qtype === "mc-quest") {
      for (const option of question.options) {
        if (yOffset < 100) {
          ({ page, yOffset } = addNewPage(pdfDoc, pageWidth, pageHeight));
        }

        const optionLines = wrapText(option, font, 10, maxWidth - 20);
        for (const line of optionLines) {
          page.drawText(line, {
            x: paddingLeft + 20,
            y: yOffset,
            size: 10,
            font: font,
          });
          yOffset -= 15;
        }
      }
    }

    if (yOffset < 100) {
      ({ page, yOffset } = addNewPage(pdfDoc, pageWidth, pageHeight));
    }

    const answerText = `Answer: ${question["user-answer"]}`;
    const answerLines = wrapText(answerText, boldFont, 12, maxWidth);
    for (const line of answerLines) {
      page.drawText(line, {
        x: paddingLeft,
        y: yOffset,
        size: 12,
        font: boldFont,
      });
      yOffset -= 20;
    }
    yOffset -= 10;

    if (question.qtype === "graphing-quest") {
      const mainCanvasId = `canvas-${index}`;
      const backgroundCanvasId = `backgroundimage-canvas-${index}`;

      async function combineCanvases(mainCanvasId, backgroundCanvasId) {
        const mainCanvas = document.getElementById(mainCanvasId);
        const backgroundCanvas = document.getElementById(backgroundCanvasId);

        if (!mainCanvas || !backgroundCanvas) {
          console.error("Canvas elements not found");
          return null;
        }

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = mainCanvas.width;
        tempCanvas.height = mainCanvas.height;
        const tempCtx = tempCanvas.getContext("2d");

        tempCtx.drawImage(
          backgroundCanvas,
          0,
          0,
          tempCanvas.width,
          tempCanvas.height
        );
        tempCtx.drawImage(
          mainCanvas,
          0,
          0,
          tempCanvas.width,
          tempCanvas.height
        );

        return tempCanvas.toDataURL("image/png");
      }

      const combinedCanvasImage = await combineCanvases(
        mainCanvasId,
        backgroundCanvasId
      );

      if (combinedCanvasImage) {
        if (yOffset < 250) {
          ({ page, yOffset } = addNewPage(pdfDoc, pageWidth, pageHeight));
        }

        const pngImage = await pdfDoc.embedPng(combinedCanvasImage);
        page.drawImage(pngImage, {
          x: paddingLeft,
          y: yOffset - 200,
          width: 200,
          height: 200,
        });
        yOffset -= 250;
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  saveAs(blob, "fileXX.pdf");
};
