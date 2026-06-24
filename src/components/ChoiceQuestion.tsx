"use client";

interface Choice {
  label: string;
  value: string;
}

interface ChoiceQuestionProps {
  question: string;
  choices: Choice[];
  onSelect: (value: string) => void;
}

export function ChoiceQuestion({
  question,
  choices,
  onSelect,
}: ChoiceQuestionProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm rounded-tl-sm mb-4">
      <p className="text-gray-900 mb-3">{question}</p>
      <div className="space-y-2">
        {choices.map((choice) => (
          <button
            key={choice.value}
            onClick={() => onSelect(choice.value)}
            className="w-full text-left px-4 py-2.5 rounded-lg border border-gray-200 hover:border-[#07c160] hover:bg-[#07c160]/5 transition-colors text-[15px]"
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
}
