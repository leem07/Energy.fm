import { useState } from 'react';
import OnboardingButton from "../Button/onboarding-buttons";

function OnboardingQuestions() {
  const questions = [
    {
      id: 1,
      question: "Do you know your resting heart rate?",
      options: ["Less than 60 bpm", "60-70 bpm", "70-80 bpm", "More than 80 bpm"]
    },
    {
      id: 2,
      question: "On average, how many hours of sleep do you get?",
      options: ["Less than 5 hours", "5-6 hours", "7-8 hours", "More than 8 hours"]
    },
    {
      id: 3,
      question: "How active are you on a typical week?",
      options: ["Not at all active", "Slightly active", "Moderately active", "Very active"]
    },
    {
      id: 4,
      question: "How would you describe your lifestyle?",
      options: ["Very sedentary", "Slightly sedentary", "Moderately sedentary", "Not sedentary"]
    }
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);

  function handleAnswer(option) {
    const q = questions[currentQuestionIndex];
    setAnswers(prev => ({ ...prev, [q.id]: option }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      setFinished(true);
    }
  }

  if (finished) {
    return (
      <div className="onboarding-questions">
        <h2>Thanks — you're all set!</h2>
        <p>Responses:</p>
        <ul>
          {questions.map(q => (
            <li key={q.id}>{q.question}: {answers[q.id]}</li>
          ))}
        </ul>
      </div>
    );
  }

  const current = questions[currentQuestionIndex];

  return (
  <div className="min-h-screen flex items-center justify-center bg-[#0C1D1F] text-white">
    <div className="flex flex-col gap-4 w-full max-w-md text-center">
      <h3>
        Question {currentQuestionIndex + 1} of {questions.length}
      </h3>

      <h2 className="text-xl font-semibold">
        {current.question}
      </h2>

      <div className="flex flex-col gap-2">
        {current.options.map((opt) => (
          <OnboardingButton
            key={opt}
            text={opt}
            onClick={() => handleAnswer(opt)}
          />
        ))}
      </div>
    </div>
  </div>
)
}

export default OnboardingQuestions;
