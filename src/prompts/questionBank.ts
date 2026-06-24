export interface ProfileQuestion {
  id: string;
  question: string;
  options: { label: string; value: string }[];
  field: "personality" | "ageRange" | "hobbies" | "emotionalPattern" | "workExperience";
}

export const QUESTION_BANK: ProfileQuestion[] = [
  {
    id: "hobby",
    question: "周末一般喜欢干嘛呀？",
    field: "hobbies",
    options: [
      { label: "在家追剧/打游戏", value: "追剧/游戏" },
      { label: "出门逛街/喝咖啡", value: "逛街/咖啡" },
      { label: "运动健身", value: "运动健身" },
      { label: "宅着什么都不干", value: "宅家" },
    ],
  },
  {
    id: "emotion",
    question: "工作中遇到烦心事，一般会怎么发泄？",
    field: "emotionalPattern",
    options: [
      { label: "找朋友吐槽", value: "倾诉型" },
      { label: "一个人消化", value: "内敛型" },
      { label: "买买买！", value: "消费型" },
      { label: "吃好吃的", value: "美食治愈型" },
    ],
  },
  {
    id: "work",
    question: "话说你是上班族吧？工作几年啦？",
    field: "workExperience",
    options: [
      { label: "刚毕业1-2年", value: "1-2年" },
      { label: "3-5年了", value: "3-5年" },
      { label: "5年以上，老油条了", value: "5年以上" },
    ],
  },
];
