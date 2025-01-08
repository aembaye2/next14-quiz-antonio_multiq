"use client";
import { useState, useEffect } from "react";
import StatCard from "./StatCard";

interface QuizProps {
  questions: {
    question: string;
    answers: string[];
    correctAnswer: string;
  }[];
  userId: string | undefined;
  quizName: string;
}

const Quiz = ({ questions, userId, quizName }: QuizProps) => {
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(
    null
  );
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
  });
  const maxTimeAllowed: number = 60;
  const [timeRemaining, setTimeRemaining] = useState(maxTimeAllowed); //adjust this
  const [timerRunning, setTimerRunning] = useState(false);

  const { question, answers, correctAnswer } = questions[activeQuestion];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerRunning && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [timerRunning, timeRemaining]);

  const startTimer = () => {
    setTimerRunning(true);
  };

  const stopTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setTimeRemaining(maxTimeAllowed);
  };

  const handleTimeUp = () => {
    //if (showResults) return; // Prevent executing this function after showing results
    stopTimer();
    resetTimer();
    nextQuestion();
  };

  useEffect(() => {
    startTimer();

    return () => {
      stopTimer();
    };
  }, []);

  const onAnswerSelected = (answer: string, idx: number) => {
    setChecked(true);
    setSelectedAnswerIndex(idx);
    if (answer === correctAnswer) {
      setSelectedAnswer(answer);
    } else {
      setSelectedAnswer("");
    }
  };

  const nextQuestion = () => {
    if (showResults) return; // Prevent further updates after showing results

    setSelectedAnswerIndex(null);
    const updatedResults = selectedAnswer
      ? {
          ...results,
          score: results.score + 1,
          correctAnswers: results.correctAnswers + 1,
        }
      : {
          ...results,
          wrongAnswers: results.wrongAnswers + 1,
        };

    setResults(updatedResults);

    if (activeQuestion !== questions.length - 1) {
      setActiveQuestion((prev) => prev + 1);
    } else {
      setShowResults(true);
      const apiRoute = quizName ? `/api/${quizName}Results` : null;

      if (!apiRoute) {
        throw new Error("Quiz name is required to determine the API route.");
      }

      //fetch("/api/quiz1Results", {
      fetch(apiRoute, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          quizScore: (100 * updatedResults.score) / questions.length,
          correctAnswers: updatedResults.correctAnswers,
          wrongAnswers: updatedResults.wrongAnswers,
          quizName: quizName,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not working.");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Quiz results saved successfully:", data);
        })
        .catch((error) => {
          console.error("Error saving quiz results:", error);
        });
    }
    setChecked(false);
    resetTimer();
    startTimer();
  };

  const previousQuestion = () => {
    if (activeQuestion > 0) {
      setActiveQuestion(activeQuestion - 1);
      setChecked(false);
      setSelectedAnswerIndex(null);
    }
  };

  return (
    <div className="min-h-[500px]">
      <div className="max-w-[1500px] mx-auto w-[90%] flex justify-center py-10 flex-col">
        {!showResults ? (
          <>
            <div className="flex justify-between mb-10 items-center">
              <div className="bg-primary text-white px-4 rounded-md py-1">
                <h2>
                  Question: {activeQuestion + 1}
                  <span>/{questions.length}</span>
                </h2>
              </div>

              <div className="bg-primary text-white px-4 rounded-md py-1">
                {timeRemaining} seconds to answer
              </div>
            </div>

            <div>
              <h3 className="mb-5 text-2xl font-bold">{question}</h3>
              <ul>
                {answers.map((answer: string, idx: number) => (
                  <li
                    key={idx}
                    onClick={() => onAnswerSelected(answer, idx)}
                    className={`cursor-pointer mb-5 py-3 rounded-md hover:bg-primary hover:text-white px-3
                      ${selectedAnswerIndex === idx && "bg-primary text-white"}
                      `}
                  >
                    <span>{answer}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between mt-4">
                <button
                  onClick={previousQuestion}
                  disabled={activeQuestion === 0}
                  className="font-bold"
                >
                  {activeQuestion === 0 ? "" : "Previous Question ←"}
                </button>
                <button
                  onClick={nextQuestion}
                  disabled={!checked}
                  className="font-bold"
                >
                  {activeQuestion === questions.length - 1
                    ? "Finish"
                    : "Next Question →"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <h3 className="text-2xl uppercase mb-10">Results 📈</h3>
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-10">
              <StatCard
                title="Percentage"
                value={`${(results.score / questions.length) * 100}%`}
              />
              <StatCard title="Total Questions" value={questions.length} />
              <StatCard title=" Total Score" value={results.score} />
              <StatCard
                title="Correct Answers"
                value={results.correctAnswers}
              />
              <StatCard title="Wrong Answers" value={results.wrongAnswers} />
            </div>

            <button
              onClick={() => window.location.reload()}
              className="p-1 rounded-md bg-dark text-white text-center text-1xl mt-10"
            >
              Restart Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
