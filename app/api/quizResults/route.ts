import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, quizScore, correctAnswers, wrongAnswers, quizName } = body;

  try {
    let existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { quizResults: true },
    });
    if (
      existingUser &&
      existingUser.quizResults &&
      existingUser.quizResults.length > 0
    ) {
      const updatedUserStats = await prisma.quizResult.update({
        where: { id: existingUser.quizResults[0].id },
        data: {
          // quizScore: existingUser.quiz3Results[0].quizScore + quizScore,
          // correctAnswers:
          //   existingUser.quiz3Results[0].correctAnswers + correctAnswers,
          // wrongAnswers:
          //   existingUser.quiz3Results[0].wrongAnswers + wrongAnswers,
          // quizName: quizName,
          quizScore: 0 + quizScore,
          correctAnswers: 0 + correctAnswers,
          wrongAnswers: 0 + wrongAnswers,
          quizName: quizName,
        },
      });
      return NextResponse.json({ updatedUserStats });
    } else {
      const newUser = await prisma.user.update({
        where: { id: userId },
        data: {
          quizResults: {
            create: {
              quizScore: quizScore,
              correctAnswers: correctAnswers,
              wrongAnswers: wrongAnswers,
              quizName: quizName,
            },
          },
        },
      });
      return NextResponse.json({ newUser });
    }
  } catch (error) {
    console.error(error);
    return;
  }
}
