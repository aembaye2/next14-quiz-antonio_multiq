import { fetchUsers } from "../(auth)/actions/fetchUsers";
//import QuizManual from "@/components/Quiz";
import QuestionsComponent from "@/components/QuestionsComponent";
//import { quiz } from "./data"; // Import the quiz data from data.ts
import { quiz } from "./data2"; // Import the quiz data from data2.ts

const quizName = "quiz3";

export const dynamic = "force-dynamic";

const page = async () => {
  const questions = quiz.questions; // Get questions from the imported quiz data, is a list
  const user = await fetchUsers();
  const userId = user?.data.user.id;

  // return (
  //   <>
  //     {/* <Quiz questions={questions} userId={userId} quizName={quizName} /> */}
  //     <Quiz questions={questions} userId={userId} quizName={quizName} />
  //   </>
  // );

  return (
    <>
      {/* <Quiz questions={questions} userId={userId} quizName={quizName} /> */}
      <QuestionsComponent
        questions={questions}
        userId={userId}
        quizName={quizName}
      />
    </>
  );
};

export default page;
