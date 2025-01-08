import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, userAnswers, quizName } = body;

  try {
    let existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { quiz3Results: true },
    });
    if (
      existingUser &&
      existingUser.quiz3Results &&
      existingUser.quiz3Results.length > 0
    ) {
      const updatedUserStats = await prisma.quiz3Result.update({
        where: { id: existingUser.quiz3Results[0].id },
        data: {
          userAnswers: userAnswers,
          quizName: quizName,
        },
      });
      return NextResponse.json({ updatedUserStats });
    } else {
      const newUser = await prisma.user.update({
        where: { id: userId },
        data: {
          quiz3Results: {
            create: {
              userAnswers: userAnswers,
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
