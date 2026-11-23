export const instant = false;

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import QuestionnaireWizard from "@/components/questionnaire/QuestionnaireWizard";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function QuestionnairePage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const plan = await prisma.businessPlan.findFirst({
    where: {
      id,
      user: { email: session.user.email },
    },
    select: {
      id: true,
      title: true,
      status: true,
      currentStep: true,
      completedSteps: true,
      step1Data: true,
      step2Data: true,
      step3Data: true,
      step4Data: true,
      step5Data: true,
      step6Data: true,
      step7Data: true,
      step8Data: true,
      step9Data: true,
      step10Data: true,
    },
  });

  if (!plan) {
    notFound();
  }

  return <QuestionnaireWizard initialPlan={plan as Parameters<typeof QuestionnaireWizard>[0]["initialPlan"]} />;
}
