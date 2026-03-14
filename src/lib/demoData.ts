import type { DebtEntry } from "@/components/app/DebtCard";

export const DEMO_SURPLUS = "650";

export const createDemoDebts = (): DebtEntry[] => [
  {
    id: crypto.randomUUID(),
    nickname: "Chase Freedom",
    type: "credit_card",
    balance: "6400",
    apr: "27.99",
    minimumPayment: "165",
    promoExpiration: "",
  },
  {
    id: crypto.randomUUID(),
    nickname: "Sallie Mae",
    type: "student_loan",
    balance: "22500",
    apr: "5.50",
    minimumPayment: "245",
    promoExpiration: "",
  },
  {
    id: crypto.randomUUID(),
    nickname: "Marcus Personal",
    type: "personal_loan",
    balance: "3000",
    apr: "13.50",
    minimumPayment: "85",
    promoExpiration: "",
  },
  {
    id: crypto.randomUUID(),
    nickname: "Toyota Corolla 2009",
    type: "auto_loan",
    balance: "4200",
    apr: "7.49",
    minimumPayment: "105",
    promoExpiration: "",
  },
];

export interface DemoChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const DEMO_CHAT_HISTORY: DemoChatMessage[] = [
  {
    role: "assistant",
    content:
      "Hi Maya — glad you're here. I can see you've got four accounts loaded. Before we run the numbers, is there anything about your situation you'd like me to know? Income patterns, upcoming expenses, anything weighing on you financially?",
  },
  {
    role: "user",
    content:
      "Sure. I'm 31, I work in marketing — my base salary is stable but I get quarterly bonuses that vary a lot. I've been making minimum payments on everything for about two years. The Chase card stresses me out the most because no matter what I pay, the balance barely moves. I have a dental procedure coming up in about six weeks that'll probably cost around $1,500 out of pocket. And honestly I just feel stuck — I know I should be doing something smarter but I don't know where to start.",
  },
  {
    role: "assistant",
    content:
      "That makes a lot of sense — carrying multiple accounts on minimums for an extended period can feel like running in place, especially when one of them has a high rate. The variability in your income is worth keeping in mind as we look at your results. And the upcoming expense is useful context too. Let's see what your numbers actually show. Is there anything else you'd like to add before we run the analysis?",
  },
];
