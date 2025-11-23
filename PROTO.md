import React, { useState, useEffect } from "react";

const levels = [
  {
    id: 1,
    image:
      "/mnt/data/A27596B2-4E8D-46F6-B5DA-6E0BC1A437E1.png",
    answers: ["八方来财"],
    altAnswers: ["八方来柴"],
  },
  {
    id: 2,
    image:
      "/mnt/data/9419EF30-A052-423F-94B2-4847651796FC.png",
    answers: ["机不可失"],
    altAnswers: ["机不可湿"],
  },
];

export default function App() {
  const [stage, setStage] = useState("home");
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentLevel = levels[currentIndex];
  const answerLength = currentLevel.answers[0].length;

  const [chars, setChars] = useState(() =>
    Array(answerLength).fill("")
  );
  const [result, setResult] = useState(null);

  useEffect(() => {
    setChars(Array(currentLevel.answers[0].length).fill(""));
    setResult(null);
  }, [currentIndex]);

  const handleCharChange = (index, value) => {
    const v = value.slice(-1);
    setChars((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
  };

  const checkAnswer = () => {
    const raw = chars.join("");
    const cleaned = raw.replace(/\s+/g, "");
    const all = [
      ...(currentLevel.answers || []),
      ...(currentLevel.altAnswers || []),
    ];
    if (all.includes(cleaned)) {
      setResult("correct");
    } else {
      setResult("wrong");
    }
  };

  const goNext = () => {
    if (currentIndex < levels.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setStage("clear");
    }
  };

  if (stage === "home") {
    return (
      <div className="w-full h-full bg-white flex flex-col items-center justify-center p-4 select-none">
        <h1 className="text-4xl font-bold mb-10">脑洞王</h1>
        <button
          onClick={() => setStage("level")}
          className="px-8 py-3 bg-blue-500 rounded-2xl text-white text-lg shadow active:scale-95 transition-transform"
        >
          开始游戏
        </button>
      </div>
    );
  }

  if (stage === "clear") {
    return (
      <div className="w-full h-full bg-white flex flex-col items-center justify-center p-4 select-none">
        <h1 className="text-3xl font-bold mb-10">恭喜通关</h1>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setStage("level");
          }}
          className="px-8 py-3 bg-blue-500 rounded-2xl text-white text-lg shadow active:scale-95 transition-transform"
        >
          再玩一轮
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white flex flex-col items-center p-4 select-none">
      <div className="w-full max-w-md mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          第 {currentIndex + 1} / {levels.length} 关
        </span>
      </div>

      <div className="w-full max-w-md mt-4">
        <img
          src={currentLevel.image}
          alt="关卡图片"
          className="w-full rounded-lg shadow-sm"
        />
      </div>

      <div className="mt-6 w-full max-w-md flex justify-center gap-2">
        {chars.map((c, idx) => (
          <input
            key={idx}
            value={c}
            onChange={(e) => handleCharChange(idx, e.target.value)}
            maxLength={1}
            className="w-10 h-12 text-2xl text-center border-b-2 border-gray-400 focus:outline-none focus:border-blue-500"
          />
        ))}
      </div>

      <button
        onClick={checkAnswer}
        className="mt-6 px-8 py-2 bg-blue-500 text-white rounded-xl text-lg shadow active:scale-95 transition-transform"
      >
        提交
      </button>

      {result && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl px-8 py-6 text-center shadow-lg scale-100">
            <div className="text-2xl font-bold mb-4">
              {result === "correct" ? "回答正确！" : "再想想"}
            </div>
            {result === "correct" ? (
              <button
                onClick={() => {
                  setResult(null);
                  goNext();
                }}
                className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-xl active:scale-95 transition-transform"
              >
                下一关
              </button>
            ) : (
              <button
                onClick={() => setResult(null)}
                className="mt-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-xl active:scale-95 transition-transform"
              >
                继续作答
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
