import Quiz from "@/components/Quiz";
import { fetchUsers } from "../(auth)/actions/fetchUsers";
import { quiz } from "./data"; // Import the quiz data from data.ts

const quizName = "quiz2";

export const dynamic = "force-dynamic";

const page = async () => {
  const questions = quiz.questions; // Get questions from the imported quiz data, is a list
  const user = await fetchUsers();
  const userId = user?.data.user.id;

  return (
    <>
      <Quiz questions={questions} userId={userId} quizName={quizName} />
    </>
  );
};

export default page;
