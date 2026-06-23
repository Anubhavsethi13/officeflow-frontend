export type ExamDepartment = "All" | "Accounts" | "Consumables" | "Hardware" | "Software" | "Software Tester" | "Support";
export type PaperRound = "assessment" | "department";
export type ExamOptionLabel = "A" | "B" | "C" | "D";

export interface ExamOption {
  label: ExamOptionLabel;
  text: string;
}

export interface ExamQuestion {
  number: number;
  section: string;
  text: string;
  options: ExamOption[];
  correctAnswer?: ExamOptionLabel | null;
  scored: boolean;
  requiresReason: boolean;
}

export interface ExamPaper {
  id: string;
  title: string;
  department: ExamDepartment;
  round: PaperRound;
  mode: "Online";
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  description: string;
  questions: ExamQuestion[];
}

// Generated from the supplied Word question papers and answer keys.
// - ASSESSMENT PAPER.docx + ASSESSMENT PAPER Answer_Key.docx
// - Accounts_Department_Question_Sheet.docx + Accounts_Department_Answer_Key.docx
// - Consumable_Department_Question_Sheet.docx + Consumable_Department_Answer_Key.docx
// - Hardware_Department_Question_Sheet.docx + Hardware_Department_Answer_Key.docx
// - Software_Department_Question_Sheet.docx + Software_Department_Answer_Key.docx
// - Software_Tester_Department_Question_Sheet.docx + Software_Tester_Department_Answer_Key.docx
// - Support_Department_Question_Sheet.docx + Support_Department_Answer_Key.docx
export const EXAM_PAPERS: ExamPaper[] = [
  {
    "id": "assessment",
    "title": "Assessment Paper",
    "department": "All",
    "round": "assessment",
    "mode": "Online",
    "durationMinutes": 60,
    "totalMarks": 40,
    "passingMarks": 20,
    "description": "Common first-round paper for every candidate. Aptitude and logical reasoning are auto-scored; personality questions are for interviewer review.",
    "questions": [
      {
        "number": 1,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "A man buys an item for Rs. 800 and sells it for Rs. 1,000. What is his profit percentage?",
        "options": [
          {
            "label": "A",
            "text": "20%"
          },
          {
            "label": "B",
            "text": "25%"
          },
          {
            "label": "C",
            "text": "30%"
          },
          {
            "label": "D",
            "text": "15%"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 2,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "If 12 workers can complete a work in 15 days, how many days will 10 workers take to complete the same work?",
        "options": [
          {
            "label": "A",
            "text": "16 days"
          },
          {
            "label": "B",
            "text": "18 days"
          },
          {
            "label": "C",
            "text": "20 days"
          },
          {
            "label": "D",
            "text": "22 days"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 3,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "The average of 5 numbers is 24. If one number is removed, the average becomes 22. What is the removed number?",
        "options": [
          {
            "label": "A",
            "text": "28"
          },
          {
            "label": "B",
            "text": "30"
          },
          {
            "label": "C",
            "text": "32"
          },
          {
            "label": "D",
            "text": "34"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 4,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "A train running at 60 km/hr crosses a pole in 18 seconds. What is the length of the train?",
        "options": [
          {
            "label": "A",
            "text": "250 m"
          },
          {
            "label": "B",
            "text": "270 m"
          },
          {
            "label": "C",
            "text": "300 m"
          },
          {
            "label": "D",
            "text": "320 m"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 5,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "If the cost price of 15 articles is equal to the selling price of 12 articles, what is the profit percentage?",
        "options": [
          {
            "label": "A",
            "text": "20%"
          },
          {
            "label": "B",
            "text": "25%"
          },
          {
            "label": "C",
            "text": "30%"
          },
          {
            "label": "D",
            "text": "15%"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 6,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "A sum of Rs. 5,000 is invested at 10% simple interest per annum. What will be the interest after 3 years?",
        "options": [
          {
            "label": "A",
            "text": "Rs. 1,000"
          },
          {
            "label": "B",
            "text": "Rs. 1,200"
          },
          {
            "label": "C",
            "text": "Rs. 1,500"
          },
          {
            "label": "D",
            "text": "Rs. 2,000"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 7,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "Find the next number in the series: 2, 6, 12, 20, 30, ?",
        "options": [
          {
            "label": "A",
            "text": "40"
          },
          {
            "label": "B",
            "text": "42"
          },
          {
            "label": "C",
            "text": "44"
          },
          {
            "label": "D",
            "text": "46"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 8,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "If 40% of a number is 80, what is the number?",
        "options": [
          {
            "label": "A",
            "text": "160"
          },
          {
            "label": "B",
            "text": "180"
          },
          {
            "label": "C",
            "text": "200"
          },
          {
            "label": "D",
            "text": "220"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 9,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "A person spends 75% of his salary and saves Rs. 7,500. What is his salary?",
        "options": [
          {
            "label": "A",
            "text": "Rs. 25,000"
          },
          {
            "label": "B",
            "text": "Rs. 30,000"
          },
          {
            "label": "C",
            "text": "Rs. 35,000"
          },
          {
            "label": "D",
            "text": "Rs. 40,000"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 10,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "The ratio of boys and girls in a class is 3:2. If there are 45 boys, how many girls are there?",
        "options": [
          {
            "label": "A",
            "text": "20"
          },
          {
            "label": "B",
            "text": "25"
          },
          {
            "label": "C",
            "text": "30"
          },
          {
            "label": "D",
            "text": "35"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 11,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "A shopkeeper gives a discount of 20% on an item marked at Rs. 2,500. What is the selling price?",
        "options": [
          {
            "label": "A",
            "text": "Rs. 1,800"
          },
          {
            "label": "B",
            "text": "Rs. 2,000"
          },
          {
            "label": "C",
            "text": "Rs. 2,100"
          },
          {
            "label": "D",
            "text": "Rs. 2,200"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 12,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "If A can complete a task in 10 days and B can complete it in 15 days, how many days will they take together?",
        "options": [
          {
            "label": "A",
            "text": "5 days"
          },
          {
            "label": "B",
            "text": "6 days"
          },
          {
            "label": "C",
            "text": "7 days"
          },
          {
            "label": "D",
            "text": "8 days"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 13,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "The difference between compound interest and simple interest on Rs. 10,000 for 2 years at 10% per annum is:",
        "options": [
          {
            "label": "A",
            "text": "Rs. 50"
          },
          {
            "label": "B",
            "text": "Rs. 100"
          },
          {
            "label": "C",
            "text": "Rs. 150"
          },
          {
            "label": "D",
            "text": "Rs. 200"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 14,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "A number is increased by 20% and then decreased by 20%. What is the final effect?",
        "options": [
          {
            "label": "A",
            "text": "No change"
          },
          {
            "label": "B",
            "text": "4% increase"
          },
          {
            "label": "C",
            "text": "4% decrease"
          },
          {
            "label": "D",
            "text": "2% decrease"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 15,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "The perimeter of a square is 64 cm. What is its area?",
        "options": [
          {
            "label": "A",
            "text": "128 cm2"
          },
          {
            "label": "B",
            "text": "196 cm2"
          },
          {
            "label": "C",
            "text": "256 cm2"
          },
          {
            "label": "D",
            "text": "324 cm2"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 16,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "If 5 pens cost Rs. 75, what is the cost of 8 pens?",
        "options": [
          {
            "label": "A",
            "text": "Rs. 100"
          },
          {
            "label": "B",
            "text": "Rs. 110"
          },
          {
            "label": "C",
            "text": "Rs. 120"
          },
          {
            "label": "D",
            "text": "Rs. 130"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 17,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "A person covers 120 km in 3 hours. What is his speed?",
        "options": [
          {
            "label": "A",
            "text": "30 km/hr"
          },
          {
            "label": "B",
            "text": "35 km/hr"
          },
          {
            "label": "C",
            "text": "40 km/hr"
          },
          {
            "label": "D",
            "text": "45 km/hr"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 18,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "Find the value of: 25% of 240 + 30% of 100",
        "options": [
          {
            "label": "A",
            "text": "80"
          },
          {
            "label": "B",
            "text": "85"
          },
          {
            "label": "C",
            "text": "90"
          },
          {
            "label": "D",
            "text": "95"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 19,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "If the selling price is Rs. 1,200 and profit is 20%, what is the cost price?",
        "options": [
          {
            "label": "A",
            "text": "Rs. 900"
          },
          {
            "label": "B",
            "text": "Rs. 1,000"
          },
          {
            "label": "C",
            "text": "Rs. 1,050"
          },
          {
            "label": "D",
            "text": "Rs. 1,100"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 20,
        "section": "SECTION A: APTITUDE - 20 MARKS",
        "text": "A bag contains 5 red balls, 3 blue balls, and 2 green balls. What is the probability of picking a blue ball?",
        "options": [
          {
            "label": "A",
            "text": "1/5"
          },
          {
            "label": "B",
            "text": "2/5"
          },
          {
            "label": "C",
            "text": "3/10"
          },
          {
            "label": "D",
            "text": "1/2"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 21,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "Find the odd one out:",
        "options": [
          {
            "label": "A",
            "text": "Apple"
          },
          {
            "label": "B",
            "text": "Mango"
          },
          {
            "label": "C",
            "text": "Carrot"
          },
          {
            "label": "D",
            "text": "Banana"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 22,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "Complete the series: A, C, F, J, O, ?",
        "options": [
          {
            "label": "A",
            "text": "S"
          },
          {
            "label": "B",
            "text": "T"
          },
          {
            "label": "C",
            "text": "U"
          },
          {
            "label": "D",
            "text": "V"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 23,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "If CAT is coded as DBU, then DOG is coded as:",
        "options": [
          {
            "label": "A",
            "text": "EPH"
          },
          {
            "label": "B",
            "text": "ENH"
          },
          {
            "label": "C",
            "text": "EOG"
          },
          {
            "label": "D",
            "text": "FPH"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 24,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "Which number will replace the question mark? 3, 6, 12, 24, ?",
        "options": [
          {
            "label": "A",
            "text": "36"
          },
          {
            "label": "B",
            "text": "42"
          },
          {
            "label": "C",
            "text": "48"
          },
          {
            "label": "D",
            "text": "54"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 25,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "In a certain code, BOOK is written as CPPL. How will TREE be written?",
        "options": [
          {
            "label": "A",
            "text": "USFF"
          },
          {
            "label": "B",
            "text": "UQFF"
          },
          {
            "label": "C",
            "text": "VSGG"
          },
          {
            "label": "D",
            "text": "UTEE"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 26,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "Pointing to a man, Ravi said, 'He is the son of my father's only son.' Who is the man?",
        "options": [
          {
            "label": "A",
            "text": "Ravi's brother"
          },
          {
            "label": "B",
            "text": "Ravi's son"
          },
          {
            "label": "C",
            "text": "Ravi's father"
          },
          {
            "label": "D",
            "text": "Ravi's uncle"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 27,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "If all roses are flowers and some flowers are red, which conclusion is definitely true?",
        "options": [
          {
            "label": "A",
            "text": "All roses are red"
          },
          {
            "label": "B",
            "text": "Some roses are red"
          },
          {
            "label": "C",
            "text": "All roses are flowers"
          },
          {
            "label": "D",
            "text": "No rose is red"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 28,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "Arrange the words in logical order: 1. Interview 2. Selection 3. Application 4. Joining 5. Shortlisting",
        "options": [
          {
            "label": "A",
            "text": "3, 5, 1, 2, 4"
          },
          {
            "label": "B",
            "text": "5, 3, 1, 2, 4"
          },
          {
            "label": "C",
            "text": "3, 1, 5, 2, 4"
          },
          {
            "label": "D",
            "text": "1, 3, 5, 2, 4"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 29,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "Find the missing number: 2, 5, 10, 17, 26, ?",
        "options": [
          {
            "label": "A",
            "text": "35"
          },
          {
            "label": "B",
            "text": "36"
          },
          {
            "label": "C",
            "text": "37"
          },
          {
            "label": "D",
            "text": "38"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 30,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "If Monday is called Tuesday, Tuesday is called Wednesday, Wednesday is called Thursday, and Thursday is called Friday, then what is the day after Tuesday called?",
        "options": [
          {
            "label": "A",
            "text": "Tuesday"
          },
          {
            "label": "B",
            "text": "Wednesday"
          },
          {
            "label": "C",
            "text": "Thursday"
          },
          {
            "label": "D",
            "text": "Friday"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 31,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "Which word does not belong to the group?",
        "options": [
          {
            "label": "A",
            "text": "Table"
          },
          {
            "label": "B",
            "text": "Chair"
          },
          {
            "label": "C",
            "text": "Sofa"
          },
          {
            "label": "D",
            "text": "Spoon"
          }
        ],
        "correctAnswer": "D",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 32,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "If 5 + 3 = 28, 9 + 1 = 810, and 8 + 2 = 610, then 7 + 4 = ?",
        "options": [
          {
            "label": "A",
            "text": "311"
          },
          {
            "label": "B",
            "text": "411"
          },
          {
            "label": "C",
            "text": "511"
          },
          {
            "label": "D",
            "text": "611"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 33,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "Complete the analogy: Doctor : Hospital :: Teacher : ?",
        "options": [
          {
            "label": "A",
            "text": "School"
          },
          {
            "label": "B",
            "text": "Book"
          },
          {
            "label": "C",
            "text": "Student"
          },
          {
            "label": "D",
            "text": "Class"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 34,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "A is taller than B. C is taller than",
        "options": [
          {
            "label": "A",
            "text": "D is shorter than"
          },
          {
            "label": "B",
            "text": "Who is the tallest?"
          },
          {
            "label": "C",
            "text": "C"
          },
          {
            "label": "D",
            "text": "D"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 35,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "Find the next term: Z, X, U, Q, L, ?",
        "options": [
          {
            "label": "A",
            "text": "F"
          },
          {
            "label": "B",
            "text": "G"
          },
          {
            "label": "C",
            "text": "H"
          },
          {
            "label": "D",
            "text": "I"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 36,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "If PEN is written as QFO, then INK is written as:",
        "options": [
          {
            "label": "A",
            "text": "JOL"
          },
          {
            "label": "B",
            "text": "JML"
          },
          {
            "label": "C",
            "text": "HOL"
          },
          {
            "label": "D",
            "text": "JNL"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 37,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "Statement: Some employees are punctual. All punctual people are responsible. Conclusion 1: Some employees are responsible. Conclusion 2: All employees are responsible.",
        "options": [
          {
            "label": "A",
            "text": "Only Conclusion 1 follows"
          },
          {
            "label": "B",
            "text": "Only Conclusion 2 follows"
          },
          {
            "label": "C",
            "text": "Both follow"
          },
          {
            "label": "D",
            "text": "Neither follows"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 38,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "Find the odd one out:",
        "options": [
          {
            "label": "A",
            "text": "9"
          },
          {
            "label": "B",
            "text": "16"
          },
          {
            "label": "C",
            "text": "25"
          },
          {
            "label": "D",
            "text": "30"
          }
        ],
        "correctAnswer": "D",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 39,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "If South-East becomes North-West, then North becomes:",
        "options": [
          {
            "label": "A",
            "text": "South"
          },
          {
            "label": "B",
            "text": "East"
          },
          {
            "label": "C",
            "text": "West"
          },
          {
            "label": "D",
            "text": "North-East"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 40,
        "section": "SECTION B: LOGICAL REASONING - 20 MARKS",
        "text": "Complete the series: 1, 4, 9, 16, 25, ?",
        "options": [
          {
            "label": "A",
            "text": "30"
          },
          {
            "label": "B",
            "text": "32"
          },
          {
            "label": "C",
            "text": "36"
          },
          {
            "label": "D",
            "text": "49"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 41,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "You are given a task that is new to you. Your manager is busy and cannot guide you immediately. What will you do first?",
        "options": [
          {
            "label": "A",
            "text": "Wait until the manager becomes free"
          },
          {
            "label": "B",
            "text": "Try to understand the task yourself and make a rough plan"
          },
          {
            "label": "C",
            "text": "Ask a colleague to do most of it"
          },
          {
            "label": "D",
            "text": "Ignore it until someone reminds you"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 42,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "You made a small mistake in your work, but no one has noticed yet. What will you do?",
        "options": [
          {
            "label": "A",
            "text": "Hide it because it is small"
          },
          {
            "label": "B",
            "text": "Correct it silently and not tell anyone"
          },
          {
            "label": "C",
            "text": "Inform the concerned person and correct it"
          },
          {
            "label": "D",
            "text": "Wait to see if someone finds it"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 43,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "You are working in a team where one member is not contributing properly. The deadline is near. What will you do?",
        "options": [
          {
            "label": "A",
            "text": "Complain directly to the manager"
          },
          {
            "label": "B",
            "text": "Ignore that person and finish only your part"
          },
          {
            "label": "C",
            "text": "Speak to the person and try to understand the issue"
          },
          {
            "label": "D",
            "text": "Stop working because the team is not supporting you"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 44,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "Your senior gives you feedback that your work quality is not good enough. You feel you worked hard. What is your response?",
        "options": [
          {
            "label": "A",
            "text": "Defend yourself immediately"
          },
          {
            "label": "B",
            "text": "Listen carefully and ask what can be improved"
          },
          {
            "label": "C",
            "text": "Feel demotivated and stop trying"
          },
          {
            "label": "D",
            "text": "Think the senior is unfair"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 45,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "You have completed your assigned work early. What will you most likely do?",
        "options": [
          {
            "label": "A",
            "text": "Sit free until new work is assigned"
          },
          {
            "label": "B",
            "text": "Ask for more responsibility or help others"
          },
          {
            "label": "C",
            "text": "Use the time for personal work"
          },
          {
            "label": "D",
            "text": "Leave the workplace mentally because your work is done"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 46,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "You are asked to complete a task by evening, but you realize it may not be possible. What will you do?",
        "options": [
          {
            "label": "A",
            "text": "Say nothing and try until the end"
          },
          {
            "label": "B",
            "text": "Inform early and explain the realistic timeline"
          },
          {
            "label": "C",
            "text": "Submit incomplete work without saying anything"
          },
          {
            "label": "D",
            "text": "Blame the task difficulty later"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 47,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "A client or senior asks something you do not know. What will you say?",
        "options": [
          {
            "label": "A",
            "text": "Give a random answer confidently"
          },
          {
            "label": "B",
            "text": "Say you do not know but will check and update"
          },
          {
            "label": "C",
            "text": "Avoid answering"
          },
          {
            "label": "D",
            "text": "Ask someone else to answer every time"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 48,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "You notice that a process in the company can be improved, but no one asked for your opinion. What will you do?",
        "options": [
          {
            "label": "A",
            "text": "Keep quiet because it is not your responsibility"
          },
          {
            "label": "B",
            "text": "Share the idea politely with the concerned person"
          },
          {
            "label": "C",
            "text": "Tell others that the process is bad"
          },
          {
            "label": "D",
            "text": "Ignore it because change is difficult"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 49,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "You are under pressure due to multiple tasks. What is your first step?",
        "options": [
          {
            "label": "A",
            "text": "Start any task randomly"
          },
          {
            "label": "B",
            "text": "Make a priority list and communicate if needed"
          },
          {
            "label": "C",
            "text": "Panic and delay everything"
          },
          {
            "label": "D",
            "text": "Work only on the easiest task"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 50,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "You are given two options: Option 1 - Finish work quickly but with average quality. Option 2 - Take slightly more time but submit better-quality work. What will you choose?",
        "options": [
          {
            "label": "A",
            "text": "Option 1 always"
          },
          {
            "label": "B",
            "text": "Option 2 always"
          },
          {
            "label": "C",
            "text": "Depends on urgency and importance"
          },
          {
            "label": "D",
            "text": "Avoid deciding and ask someone else"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 51,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "When someone gives you feedback that hurts, what is your first natural reaction?",
        "options": [
          {
            "label": "A",
            "text": "I immediately defend myself"
          },
          {
            "label": "B",
            "text": "I feel upset but try to understand it later"
          },
          {
            "label": "C",
            "text": "I ignore the feedback completely"
          },
          {
            "label": "D",
            "text": "I become motivated to improve immediately"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 52,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "Which statement sounds most like you?",
        "options": [
          {
            "label": "A",
            "text": "I prefer being right"
          },
          {
            "label": "B",
            "text": "I prefer keeping peace"
          },
          {
            "label": "C",
            "text": "I prefer understanding different perspectives"
          },
          {
            "label": "D",
            "text": "It depends on the situation"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 53,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "When you are facing a personal challenge, you usually:",
        "options": [
          {
            "label": "A",
            "text": "Keep everything to yourself"
          },
          {
            "label": "B",
            "text": "Seek advice from trusted people"
          },
          {
            "label": "C",
            "text": "Distract yourself and avoid thinking about it"
          },
          {
            "label": "D",
            "text": "Break the problem into smaller parts and deal with it"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 54,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "If someone succeeds where you failed, what do you feel first?",
        "options": [
          {
            "label": "A",
            "text": "Jealousy"
          },
          {
            "label": "B",
            "text": "Inspiration"
          },
          {
            "label": "C",
            "text": "Curiosity about how they did it"
          },
          {
            "label": "D",
            "text": "Indifference"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 55,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "Which quality do you value most in people?",
        "options": [
          {
            "label": "A",
            "text": "Intelligence"
          },
          {
            "label": "B",
            "text": "Honesty"
          },
          {
            "label": "C",
            "text": "Kindness"
          },
          {
            "label": "D",
            "text": "Ambition"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 56,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "When plans suddenly change, you usually:",
        "options": [
          {
            "label": "A",
            "text": "Feel frustrated for a long time"
          },
          {
            "label": "B",
            "text": "Adapt quickly and move forward"
          },
          {
            "label": "C",
            "text": "Wait for others to decide what to do"
          },
          {
            "label": "D",
            "text": "Try to understand the new situation first"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 57,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "If a close friend describes you honestly, what would they most likely say?",
        "options": [
          {
            "label": "A",
            "text": "Reliable"
          },
          {
            "label": "B",
            "text": "Ambitious"
          },
          {
            "label": "C",
            "text": "Caring"
          },
          {
            "label": "D",
            "text": "Independent"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 58,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "Which situation makes you most uncomfortable?",
        "options": [
          {
            "label": "A",
            "text": "Being criticized publicly"
          },
          {
            "label": "B",
            "text": "Making a mistake that affects others"
          },
          {
            "label": "C",
            "text": "Not knowing what to do"
          },
          {
            "label": "D",
            "text": "Having to disagree with someone"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 59,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "Which statement do you agree with most?",
        "options": [
          {
            "label": "A",
            "text": "People rarely change"
          },
          {
            "label": "B",
            "text": "Most people can grow if they try"
          },
          {
            "label": "C",
            "text": "Success is mostly luck"
          },
          {
            "label": "D",
            "text": "Success is mostly talent"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 60,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "If you had one extra free day every week with no obligations, what would you most likely do?",
        "options": [
          {
            "label": "A",
            "text": "Learn something new"
          },
          {
            "label": "B",
            "text": "Spend time with family or friends"
          },
          {
            "label": "C",
            "text": "Rest and recharge"
          },
          {
            "label": "D",
            "text": "Work on a personal passion or project"
          }
        ],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": true
      },
      {
        "number": 61,
        "section": "SECTION C: Workplace values & Behavioral Judgement Assessment",
        "text": "Tell us about a belief, habit, or opinion you had 3 years ago that has changed. What caused the change?",
        "options": [],
        "correctAnswer": null,
        "scored": false,
        "requiresReason": false
      }
    ]
  },
  {
    "id": "accounts",
    "title": "Accounts Department Paper",
    "department": "Accounts",
    "round": "department",
    "mode": "Online",
    "durationMinutes": 30,
    "totalMarks": 20,
    "passingMarks": 10,
    "description": "Accounts MCQ paper covering accounting principles, journal entries, GST, ledgers, and trial balance basics.",
    "questions": [
      {
        "number": 1,
        "section": "",
        "text": "Which accounting principle states that expenses should be recorded in the same period as the revenue they help generate?",
        "options": [
          {
            "label": "A",
            "text": "Matching principle"
          },
          {
            "label": "B",
            "text": "Dual aspect principle"
          },
          {
            "label": "C",
            "text": "Going concern principle"
          },
          {
            "label": "D",
            "text": "Conservatism principle"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 2,
        "section": "",
        "text": "A business purchases goods worth Rs. 50,000 on credit from ABC Traders. What is the correct journal entry?",
        "options": [
          {
            "label": "A",
            "text": "Purchase A/c Dr. 50,000 To Cash A/c 50,000"
          },
          {
            "label": "B",
            "text": "Purchase A/c Dr. 50,000 To ABC Traders A/c 50,000"
          },
          {
            "label": "C",
            "text": "ABC Traders A/c Dr. 50,000 To Purchase A/c 50,000"
          },
          {
            "label": "D",
            "text": "Cash A/c Dr. 50,000 To Purchase A/c 50,000"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 3,
        "section": "",
        "text": "Rent paid in advance is recorded as:",
        "options": [
          {
            "label": "A",
            "text": "Expense"
          },
          {
            "label": "B",
            "text": "Liability"
          },
          {
            "label": "C",
            "text": "Asset"
          },
          {
            "label": "D",
            "text": "Income"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 4,
        "section": "",
        "text": "Goods sold for cash Rs. 20,000 will affect which accounts?",
        "options": [
          {
            "label": "A",
            "text": "Sales and Debtors"
          },
          {
            "label": "B",
            "text": "Sales and Cash"
          },
          {
            "label": "C",
            "text": "Purchase and Cash"
          },
          {
            "label": "D",
            "text": "Sales and Creditors"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 5,
        "section": "",
        "text": "Which document is issued by a seller to request payment from a buyer?",
        "options": [
          {
            "label": "A",
            "text": "Debit note"
          },
          {
            "label": "B",
            "text": "Purchase order"
          },
          {
            "label": "C",
            "text": "Invoice"
          },
          {
            "label": "D",
            "text": "Bank statement"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 6,
        "section": "",
        "text": "In bank reconciliation, a cheque issued but not yet presented will result in:",
        "options": [
          {
            "label": "A",
            "text": "Balance as per bank being higher than cash book"
          },
          {
            "label": "B",
            "text": "Balance as per bank being lower than cash book"
          },
          {
            "label": "C",
            "text": "No difference"
          },
          {
            "label": "D",
            "text": "Cash book balance becoming zero"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 7,
        "section": "",
        "text": "If opening stock is Rs. 40,000, purchases are Rs. 1,20,000, and closing stock is Rs. 30,000, what is the cost of goods sold?",
        "options": [
          {
            "label": "A",
            "text": "Rs. 1,10,000"
          },
          {
            "label": "B",
            "text": "Rs. 1,20,000"
          },
          {
            "label": "C",
            "text": "Rs. 1,30,000"
          },
          {
            "label": "D",
            "text": "Rs. 1,50,000"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 8,
        "section": "",
        "text": "Which of the following is a liability?",
        "options": [
          {
            "label": "A",
            "text": "Cash"
          },
          {
            "label": "B",
            "text": "Debtors"
          },
          {
            "label": "C",
            "text": "Creditors"
          },
          {
            "label": "D",
            "text": "Stock"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 9,
        "section": "",
        "text": "GST paid on purchases is generally recorded as:",
        "options": [
          {
            "label": "A",
            "text": "Output GST"
          },
          {
            "label": "B",
            "text": "Input GST"
          },
          {
            "label": "C",
            "text": "Sales tax payable"
          },
          {
            "label": "D",
            "text": "Direct income"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 10,
        "section": "",
        "text": "TDS deducted by a customer from our payment should be recorded as:",
        "options": [
          {
            "label": "A",
            "text": "Expense"
          },
          {
            "label": "B",
            "text": "Asset/Recoverable"
          },
          {
            "label": "C",
            "text": "Liability"
          },
          {
            "label": "D",
            "text": "Sales discount"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 11,
        "section": "",
        "text": "A debit note is generally issued when:",
        "options": [
          {
            "label": "A",
            "text": "Goods are sold on cash"
          },
          {
            "label": "B",
            "text": "Goods are returned to supplier"
          },
          {
            "label": "C",
            "text": "Salary is paid"
          },
          {
            "label": "D",
            "text": "Bank charges are deducted"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 12,
        "section": "",
        "text": "Which account is credited when depreciation is recorded?",
        "options": [
          {
            "label": "A",
            "text": "Depreciation Expense A/c"
          },
          {
            "label": "B",
            "text": "Fixed Asset A/c or Accumulated Depreciation A/c"
          },
          {
            "label": "C",
            "text": "Cash A/c"
          },
          {
            "label": "D",
            "text": "Capital A/c"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 13,
        "section": "",
        "text": "If total assets are Rs. 5,00,000 and total liabilities are Rs. 2,00,000, owner's equity is:",
        "options": [
          {
            "label": "A",
            "text": "Rs. 2,00,000"
          },
          {
            "label": "B",
            "text": "Rs. 3,00,000"
          },
          {
            "label": "C",
            "text": "Rs. 5,00,000"
          },
          {
            "label": "D",
            "text": "Rs. 7,00,000"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 14,
        "section": "",
        "text": "Which report shows the financial position of a business on a particular date?",
        "options": [
          {
            "label": "A",
            "text": "Trial Balance"
          },
          {
            "label": "B",
            "text": "Profit and Loss Account"
          },
          {
            "label": "C",
            "text": "Balance Sheet"
          },
          {
            "label": "D",
            "text": "Sales Register"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 15,
        "section": "",
        "text": "Which Excel function is commonly used to total a range of numbers?",
        "options": [
          {
            "label": "A",
            "text": "COUNT"
          },
          {
            "label": "B",
            "text": "SUM"
          },
          {
            "label": "C",
            "text": "IF"
          },
          {
            "label": "D",
            "text": "VLOOKUP"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 16,
        "section": "",
        "text": "Outstanding salary at year-end should be shown as:",
        "options": [
          {
            "label": "A",
            "text": "Asset"
          },
          {
            "label": "B",
            "text": "Liability"
          },
          {
            "label": "C",
            "text": "Income"
          },
          {
            "label": "D",
            "text": "Drawings"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 17,
        "section": "",
        "text": "Which of the following is a direct expense for a trading business?",
        "options": [
          {
            "label": "A",
            "text": "Office rent"
          },
          {
            "label": "B",
            "text": "Carriage inward"
          },
          {
            "label": "C",
            "text": "Advertisement"
          },
          {
            "label": "D",
            "text": "Audit fees"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 18,
        "section": "",
        "text": "If sales are Rs. 2,00,000, gross profit is Rs. 50,000, and indirect expenses are Rs. 20,000, net profit is:",
        "options": [
          {
            "label": "A",
            "text": "Rs. 20,000"
          },
          {
            "label": "B",
            "text": "Rs. 30,000"
          },
          {
            "label": "C",
            "text": "Rs. 50,000"
          },
          {
            "label": "D",
            "text": "Rs. 70,000"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 19,
        "section": "",
        "text": "A trial balance is prepared to check:",
        "options": [
          {
            "label": "A",
            "text": "Profit only"
          },
          {
            "label": "B",
            "text": "Bank balance only"
          },
          {
            "label": "C",
            "text": "Arithmetical accuracy of ledger posting"
          },
          {
            "label": "D",
            "text": "GST return status"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 20,
        "section": "",
        "text": "Which entry is passed for cash withdrawn by proprietor for personal use?",
        "options": [
          {
            "label": "A",
            "text": "Drawings A/c Dr. To Cash A/c"
          },
          {
            "label": "B",
            "text": "Cash A/c Dr. To Drawings A/c"
          },
          {
            "label": "C",
            "text": "Capital A/c Dr. To Sales A/c"
          },
          {
            "label": "D",
            "text": "Expense A/c Dr. To Cash A/c"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      }
    ]
  },
  {
    "id": "consumables",
    "title": "Consumables Department Paper",
    "department": "Consumables",
    "round": "department",
    "mode": "Online",
    "durationMinutes": 30,
    "totalMarks": 20,
    "passingMarks": 10,
    "description": "Consumables MCQ paper covering stock handling, FIFO, documentation, reorder levels, and store discipline.",
    "questions": [
      {
        "number": 1,
        "section": "Consumable Department Knowledge",
        "text": "Which method should be followed for issuing old stock first from inventory?",
        "options": [
          {
            "label": "A",
            "text": "LIFO"
          },
          {
            "label": "B",
            "text": "FIFO"
          },
          {
            "label": "C",
            "text": "Random issue"
          },
          {
            "label": "D",
            "text": "Highest price first"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 2,
        "section": "Consumable Department Knowledge",
        "text": "What is the main purpose of maintaining minimum stock level?",
        "options": [
          {
            "label": "A",
            "text": "To increase purchase cost"
          },
          {
            "label": "B",
            "text": "To avoid stock-out situations"
          },
          {
            "label": "C",
            "text": "To stop purchase activity"
          },
          {
            "label": "D",
            "text": "To reduce stock records"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 3,
        "section": "Consumable Department Knowledge",
        "text": "A consumable item has opening stock of 100 units, purchases of 50 units, and issues of 70 units. What is the closing stock?",
        "options": [
          {
            "label": "A",
            "text": "70 units"
          },
          {
            "label": "B",
            "text": "80 units"
          },
          {
            "label": "C",
            "text": "90 units"
          },
          {
            "label": "D",
            "text": "120 units"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 4,
        "section": "Consumable Department Knowledge",
        "text": "Which document is usually prepared when material is received from a vendor?",
        "options": [
          {
            "label": "A",
            "text": "Delivery challan / GRN"
          },
          {
            "label": "B",
            "text": "Salary slip"
          },
          {
            "label": "C",
            "text": "Leave application"
          },
          {
            "label": "D",
            "text": "Interview form"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 5,
        "section": "Consumable Department Knowledge",
        "text": "What should be checked first when receiving consumable material from a vendor?",
        "options": [
          {
            "label": "A",
            "text": "Only vendor name"
          },
          {
            "label": "B",
            "text": "Quantity, item condition, and invoice/challan details"
          },
          {
            "label": "C",
            "text": "Employee attendance"
          },
          {
            "label": "D",
            "text": "Office timing"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 6,
        "section": "Consumable Department Knowledge",
        "text": "If physical stock is less than system stock, what should be done first?",
        "options": [
          {
            "label": "A",
            "text": "Ignore it"
          },
          {
            "label": "B",
            "text": "Adjust stock without checking"
          },
          {
            "label": "C",
            "text": "Verify issue entries, receipts, and physical count again"
          },
          {
            "label": "D",
            "text": "Blame the storekeeper immediately"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 7,
        "section": "Consumable Department Knowledge",
        "text": "Which of the following is an example of consumable material?",
        "options": [
          {
            "label": "A",
            "text": "Office printer toner"
          },
          {
            "label": "B",
            "text": "Company building"
          },
          {
            "label": "C",
            "text": "Land"
          },
          {
            "label": "D",
            "text": "Long-term investment"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 8,
        "section": "Consumable Department Knowledge",
        "text": "What does reorder level mean?",
        "options": [
          {
            "label": "A",
            "text": "Stock level at which new purchase should be initiated"
          },
          {
            "label": "B",
            "text": "Maximum possible stock only"
          },
          {
            "label": "C",
            "text": "Rejected stock quantity"
          },
          {
            "label": "D",
            "text": "Damaged stock quantity"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 9,
        "section": "Consumable Department Knowledge",
        "text": "Why is vendor comparison important before purchasing consumables?",
        "options": [
          {
            "label": "A",
            "text": "To delay the purchase"
          },
          {
            "label": "B",
            "text": "To compare price, quality, delivery time, and reliability"
          },
          {
            "label": "C",
            "text": "To select the highest price"
          },
          {
            "label": "D",
            "text": "To avoid documentation"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 10,
        "section": "Consumable Department Knowledge",
        "text": "If the invoice quantity is 100 units but actual received quantity is 95 units, what should be done?",
        "options": [
          {
            "label": "A",
            "text": "Accept invoice as it is"
          },
          {
            "label": "B",
            "text": "Record 100 units anyway"
          },
          {
            "label": "C",
            "text": "Inform the concerned person/vendor and record actual receipt"
          },
          {
            "label": "D",
            "text": "Throw away the invoice"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 11,
        "section": "Consumable Department Knowledge",
        "text": "Which report helps management understand monthly usage of consumables?",
        "options": [
          {
            "label": "A",
            "text": "Consumption report"
          },
          {
            "label": "B",
            "text": "Interview report"
          },
          {
            "label": "C",
            "text": "Visitor pass"
          },
          {
            "label": "D",
            "text": "Salary increment letter"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 12,
        "section": "Consumable Department Knowledge",
        "text": "Why should expensive or fast-moving consumables be monitored more closely?",
        "options": [
          {
            "label": "A",
            "text": "Because they have no value"
          },
          {
            "label": "B",
            "text": "Because misuse or shortage can increase cost or affect work"
          },
          {
            "label": "C",
            "text": "Because they never get used"
          },
          {
            "label": "D",
            "text": "Because records are not needed"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 13,
        "section": "Consumable Department Knowledge",
        "text": "What is the correct action if received material is damaged?",
        "options": [
          {
            "label": "A",
            "text": "Use it without informing"
          },
          {
            "label": "B",
            "text": "Hide it in store"
          },
          {
            "label": "C",
            "text": "Report it and keep it separately for vendor/approval decision"
          },
          {
            "label": "D",
            "text": "Mix it with good stock"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 14,
        "section": "Consumable Department Knowledge",
        "text": "Which detail is important in a purchase indent/request?",
        "options": [
          {
            "label": "A",
            "text": "Item name, quantity, requirement reason, and required date"
          },
          {
            "label": "B",
            "text": "Candidate hobby"
          },
          {
            "label": "C",
            "text": "Personal password"
          },
          {
            "label": "D",
            "text": "Lunch preference"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 15,
        "section": "Consumable Department Knowledge",
        "text": "What is the benefit of maintaining stock records regularly?",
        "options": [
          {
            "label": "A",
            "text": "It creates confusion"
          },
          {
            "label": "B",
            "text": "It helps track availability, usage, purchase need, and accountability"
          },
          {
            "label": "C",
            "text": "It removes the need for physical stock"
          },
          {
            "label": "D",
            "text": "It stops all purchases"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 16,
        "section": "Consumable Department Knowledge",
        "text": "If an item is rarely used but necessary during emergencies, how should it be handled?",
        "options": [
          {
            "label": "A",
            "text": "Never keep it"
          },
          {
            "label": "B",
            "text": "Maintain controlled minimum stock"
          },
          {
            "label": "C",
            "text": "Keep unlimited stock"
          },
          {
            "label": "D",
            "text": "Give it to anyone"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 17,
        "section": "Consumable Department Knowledge",
        "text": "What should be done before issuing consumable material to a department/user?",
        "options": [
          {
            "label": "A",
            "text": "Record the issue with item, quantity, date, and receiver details"
          },
          {
            "label": "B",
            "text": "Issue without entry"
          },
          {
            "label": "C",
            "text": "Ask them to take anything"
          },
          {
            "label": "D",
            "text": "Delete old records"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 18,
        "section": "Consumable Department Knowledge",
        "text": "Which one is a good practice for store organization?",
        "options": [
          {
            "label": "A",
            "text": "Keep all items mixed"
          },
          {
            "label": "B",
            "text": "Label items and keep them category-wise"
          },
          {
            "label": "C",
            "text": "Store damaged and good items together"
          },
          {
            "label": "D",
            "text": "Avoid counting stock"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 19,
        "section": "Consumable Department Knowledge",
        "text": "If monthly consumption suddenly increases abnormally, what should the consumable team do?",
        "options": [
          {
            "label": "A",
            "text": "Ignore it"
          },
          {
            "label": "B",
            "text": "Review usage reason, issue records, and department requirement"
          },
          {
            "label": "C",
            "text": "Stop all issue permanently"
          },
          {
            "label": "D",
            "text": "Delete the report"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 20,
        "section": "Consumable Department Knowledge",
        "text": "Which skill is most important for a consumable department employee?",
        "options": [
          {
            "label": "A",
            "text": "Guessing without records"
          },
          {
            "label": "B",
            "text": "Accuracy in stock handling, documentation, and follow-up"
          },
          {
            "label": "C",
            "text": "Avoiding communication"
          },
          {
            "label": "D",
            "text": "Not updating entries"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      }
    ]
  },
  {
    "id": "hardware",
    "title": "Hardware & Deployment Department Paper",
    "department": "Hardware",
    "round": "department",
    "mode": "Online",
    "durationMinutes": 30,
    "totalMarks": 20,
    "passingMarks": 10,
    "description": "Hardware and deployment MCQ paper covering site readiness, tools, troubleshooting, assets, and escalation.",
    "questions": [
      {
        "number": 1,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "Before visiting a client site for hardware installation, what should you check first?",
        "options": [
          {
            "label": "A",
            "text": "Only the travel distance"
          },
          {
            "label": "B",
            "text": "Required hardware, tools, access permission, and client availability"
          },
          {
            "label": "C",
            "text": "Whether lunch is arranged"
          },
          {
            "label": "D",
            "text": "Only the invoice amount"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 2,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "Which tool is commonly used to check whether a network cable is properly crimped?",
        "options": [
          {
            "label": "A",
            "text": "Cable tester"
          },
          {
            "label": "B",
            "text": "Screwdriver"
          },
          {
            "label": "C",
            "text": "Multimeter only"
          },
          {
            "label": "D",
            "text": "Printer scanner"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 3,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "A computer is not turning on. What is the best first-level check?",
        "options": [
          {
            "label": "A",
            "text": "Format the system immediately"
          },
          {
            "label": "B",
            "text": "Check power cable, socket, adapter/SMPS, and power button"
          },
          {
            "label": "C",
            "text": "Replace the monitor first"
          },
          {
            "label": "D",
            "text": "Install new software"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 4,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "What does LAN stand for?",
        "options": [
          {
            "label": "A",
            "text": "Local Area Network"
          },
          {
            "label": "B",
            "text": "Large Access Number"
          },
          {
            "label": "C",
            "text": "Line Adapter Node"
          },
          {
            "label": "D",
            "text": "Logical Account Name"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 5,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "Which connector is generally used for Ethernet/LAN cable?",
        "options": [
          {
            "label": "A",
            "text": "RJ45"
          },
          {
            "label": "B",
            "text": "HDMI"
          },
          {
            "label": "C",
            "text": "VGA"
          },
          {
            "label": "D",
            "text": "USB-C only"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 6,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "During installation at a client site, why is documentation important?",
        "options": [
          {
            "label": "A",
            "text": "To increase paperwork only"
          },
          {
            "label": "B",
            "text": "To record installed items, serial numbers, configuration, and handover status"
          },
          {
            "label": "C",
            "text": "To avoid doing actual work"
          },
          {
            "label": "D",
            "text": "It is only required for accounts"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 7,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "A user says the monitor display is blank, but the CPU is running. What should you check first?",
        "options": [
          {
            "label": "A",
            "text": "Keyboard language"
          },
          {
            "label": "B",
            "text": "Monitor power, display cable, input source, and brightness"
          },
          {
            "label": "C",
            "text": "Antivirus version"
          },
          {
            "label": "D",
            "text": "Printer queue"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 8,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "Which of the following is a safe practice while handling computer hardware?",
        "options": [
          {
            "label": "A",
            "text": "Touch all circuits with wet hands"
          },
          {
            "label": "B",
            "text": "Disconnect power before opening hardware"
          },
          {
            "label": "C",
            "text": "Keep wires loose on the floor"
          },
          {
            "label": "D",
            "text": "Force every connector if it does not fit"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 9,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "What is the purpose of an IP address?",
        "options": [
          {
            "label": "A",
            "text": "To identify a device on a network"
          },
          {
            "label": "B",
            "text": "To increase RAM speed"
          },
          {
            "label": "C",
            "text": "To print documents"
          },
          {
            "label": "D",
            "text": "To clean temporary files"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 10,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "A printer is connected but not printing. Which step should be checked early?",
        "options": [
          {
            "label": "A",
            "text": "Check printer power, cable/network, paper, toner/ink, and default printer setting"
          },
          {
            "label": "B",
            "text": "Delete all user data"
          },
          {
            "label": "C",
            "text": "Replace the CPU"
          },
          {
            "label": "D",
            "text": "Change office Wi-Fi name immediately"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 11,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "What should you do if required hardware is damaged during delivery or installation?",
        "options": [
          {
            "label": "A",
            "text": "Hide it and continue"
          },
          {
            "label": "B",
            "text": "Report immediately with photo/proof and follow replacement process"
          },
          {
            "label": "C",
            "text": "Blame the client without checking"
          },
          {
            "label": "D",
            "text": "Throw it away"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 12,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "Which device is commonly used to connect multiple devices in a wired network?",
        "options": [
          {
            "label": "A",
            "text": "Network switch"
          },
          {
            "label": "B",
            "text": "Mouse"
          },
          {
            "label": "C",
            "text": "Projector remote"
          },
          {
            "label": "D",
            "text": "Barcode label only"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 13,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "What is the correct approach when installing software/drivers for hardware?",
        "options": [
          {
            "label": "A",
            "text": "Download from any random website"
          },
          {
            "label": "B",
            "text": "Use official/source-approved drivers and verify compatibility"
          },
          {
            "label": "C",
            "text": "Install many drivers without checking"
          },
          {
            "label": "D",
            "text": "Skip driver installation always"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 14,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "A client asks you to install extra hardware that is not mentioned in the work order. What should you do?",
        "options": [
          {
            "label": "A",
            "text": "Do it without informing anyone"
          },
          {
            "label": "B",
            "text": "Confirm with office/manager and document the request"
          },
          {
            "label": "C",
            "text": "Refuse rudely"
          },
          {
            "label": "D",
            "text": "Take cash and complete it personally"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 15,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "Which of the following is important for cable management?",
        "options": [
          {
            "label": "A",
            "text": "Leaving cables tangled"
          },
          {
            "label": "B",
            "text": "Proper labeling, routing, and avoiding loose wires"
          },
          {
            "label": "C",
            "text": "Hiding cables under heavy equipment"
          },
          {
            "label": "D",
            "text": "Cutting extra cable randomly"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 16,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "What does UPS mainly provide?",
        "options": [
          {
            "label": "A",
            "text": "Internet speed"
          },
          {
            "label": "B",
            "text": "Backup power and protection during power failure/fluctuation"
          },
          {
            "label": "C",
            "text": "Printer ink"
          },
          {
            "label": "D",
            "text": "Software license"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 17,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "After hardware installation, what should be done before leaving the site?",
        "options": [
          {
            "label": "A",
            "text": "Leave quickly without checking"
          },
          {
            "label": "B",
            "text": "Test the setup, take confirmation, document handover, and update status"
          },
          {
            "label": "C",
            "text": "Ask the client to test later only"
          },
          {
            "label": "D",
            "text": "Remove labels from devices"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 18,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "If a device is not connecting to the network, which is a logical first troubleshooting sequence?",
        "options": [
          {
            "label": "A",
            "text": "Check cable/Wi-Fi, IP settings, network device status, then escalate if needed"
          },
          {
            "label": "B",
            "text": "Replace all systems immediately"
          },
          {
            "label": "C",
            "text": "Ignore the issue"
          },
          {
            "label": "D",
            "text": "Change all passwords first"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 19,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "Why should serial numbers/assets be recorded during deployment?",
        "options": [
          {
            "label": "A",
            "text": "For tracking warranty, inventory, and accountability"
          },
          {
            "label": "B",
            "text": "Only for decoration"
          },
          {
            "label": "C",
            "text": "To confuse users"
          },
          {
            "label": "D",
            "text": "It is not useful"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 20,
        "section": "Hardware & Deployment Department Question Paper",
        "text": "At a client site, you do not know the solution to a technical issue. What is the best action?",
        "options": [
          {
            "label": "A",
            "text": "Give a random answer"
          },
          {
            "label": "B",
            "text": "Inform that you will check, contact senior/technical team, and update properly"
          },
          {
            "label": "C",
            "text": "Leave the site silently"
          },
          {
            "label": "D",
            "text": "Blame the customer"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      }
    ]
  },
  {
    "id": "software",
    "title": "Software Department Paper",
    "department": "Software",
    "round": "department",
    "mode": "Online",
    "durationMinutes": 30,
    "totalMarks": 20,
    "passingMarks": 10,
    "description": "Software MCQ paper covering debugging, JavaScript basics, APIs, databases, deployment, and maintainability.",
    "questions": [
      {
        "number": 1,
        "section": "Software Department Question Paper",
        "text": "A user reports that the application crashes only after clicking the Save button. What should a developer check first?",
        "options": [
          {
            "label": "A",
            "text": "Rewrite the full application"
          },
          {
            "label": "B",
            "text": "Check the Save button flow, API call, request payload, and error logs"
          },
          {
            "label": "C",
            "text": "Tell the user to avoid Save button"
          },
          {
            "label": "D",
            "text": "Change the UI color"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 2,
        "section": "Software Department Question Paper",
        "text": "What will be the output of this JavaScript code? let x = 5; console.log(x++); console.log(x);",
        "options": [
          {
            "label": "A",
            "text": "5 and 5"
          },
          {
            "label": "B",
            "text": "6 and 6"
          },
          {
            "label": "C",
            "text": "5 and 6"
          },
          {
            "label": "D",
            "text": "6 and 5"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 3,
        "section": "Software Department Question Paper",
        "text": "You need to find duplicate values in a list of employee IDs. Which data structure is usually most efficient for checking duplicates?",
        "options": [
          {
            "label": "A",
            "text": "Set"
          },
          {
            "label": "B",
            "text": "Queue"
          },
          {
            "label": "C",
            "text": "Stack"
          },
          {
            "label": "D",
            "text": "Tree only"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 4,
        "section": "Software Department Question Paper",
        "text": "A page is loading slowly because it calls the same API many times unnecessarily. What is the best fix?",
        "options": [
          {
            "label": "A",
            "text": "Increase font size"
          },
          {
            "label": "B",
            "text": "Optimize API calls, cache data if suitable, and avoid repeated calls"
          },
          {
            "label": "C",
            "text": "Add more buttons"
          },
          {
            "label": "D",
            "text": "Refresh the page automatically"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 5,
        "section": "Software Department Question Paper",
        "text": "Which HTTP status code usually means 'Not Found'?",
        "options": [
          {
            "label": "A",
            "text": "200"
          },
          {
            "label": "B",
            "text": "201"
          },
          {
            "label": "C",
            "text": "404"
          },
          {
            "label": "D",
            "text": "500"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 6,
        "section": "Software Department Question Paper",
        "text": "A developer receives an error: 'Cannot read property name of undefined'. What is the most likely issue?",
        "options": [
          {
            "label": "A",
            "text": "The variable/object is undefined before accessing name"
          },
          {
            "label": "B",
            "text": "The internet is slow"
          },
          {
            "label": "C",
            "text": "The database is full"
          },
          {
            "label": "D",
            "text": "The CSS file is missing"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 7,
        "section": "Software Department Question Paper",
        "text": "Which SQL query is used to fetch all records from a table named Employees?",
        "options": [
          {
            "label": "A",
            "text": "GET * Employees"
          },
          {
            "label": "B",
            "text": "SELECT * FROM Employees"
          },
          {
            "label": "C",
            "text": "FETCH Employees ALL"
          },
          {
            "label": "D",
            "text": "SHOW ALL Employees"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 8,
        "section": "Software Department Question Paper",
        "text": "In Git, what is the purpose of creating a branch?",
        "options": [
          {
            "label": "A",
            "text": "To delete the project"
          },
          {
            "label": "B",
            "text": "To work on changes separately without directly affecting the main code"
          },
          {
            "label": "C",
            "text": "To increase file size"
          },
          {
            "label": "D",
            "text": "To install software"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 9,
        "section": "Software Department Question Paper",
        "text": "A bug is reported, but you cannot reproduce it on your system. What should you do next?",
        "options": [
          {
            "label": "A",
            "text": "Close the bug immediately"
          },
          {
            "label": "B",
            "text": "Ask for steps, screenshots, user environment, data, and logs"
          },
          {
            "label": "C",
            "text": "Blame the tester"
          },
          {
            "label": "D",
            "text": "Ignore it until it happens again"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 10,
        "section": "Software Department Question Paper",
        "text": "Which is the best practice for storing passwords in a database?",
        "options": [
          {
            "label": "A",
            "text": "Store plain text passwords"
          },
          {
            "label": "B",
            "text": "Store passwords in Excel"
          },
          {
            "label": "C",
            "text": "Store securely hashed passwords"
          },
          {
            "label": "D",
            "text": "Store them in comments inside code"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 11,
        "section": "Software Department Question Paper",
        "text": "What is the time complexity of searching an element in a sorted array using binary search?",
        "options": [
          {
            "label": "A",
            "text": "O(1)"
          },
          {
            "label": "B",
            "text": "O(log n)"
          },
          {
            "label": "C",
            "text": "O(n)"
          },
          {
            "label": "D",
            "text": "O(n)"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 12,
        "section": "Software Department Question Paper",
        "text": "A function is becoming very long and difficult to understand. What should you do?",
        "options": [
          {
            "label": "A",
            "text": "Keep adding more code"
          },
          {
            "label": "B",
            "text": "Break it into smaller meaningful functions"
          },
          {
            "label": "C",
            "text": "Remove comments only"
          },
          {
            "label": "D",
            "text": "Copy it into another file"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 13,
        "section": "Software Department Question Paper",
        "text": "You are asked to build an API for creating a new customer. Which HTTP method is most suitable?",
        "options": [
          {
            "label": "A",
            "text": "GET"
          },
          {
            "label": "B",
            "text": "POST"
          },
          {
            "label": "C",
            "text": "DELETE"
          },
          {
            "label": "D",
            "text": "PATCH only"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 14,
        "section": "Software Department Question Paper",
        "text": "Which of the following is a good variable name?",
        "options": [
          {
            "label": "A",
            "text": "a"
          },
          {
            "label": "B",
            "text": "data1"
          },
          {
            "label": "C",
            "text": "customerInvoiceTotal"
          },
          {
            "label": "D",
            "text": "x123"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 15,
        "section": "Software Department Question Paper",
        "text": "A production issue is affecting all users. What should a developer do first?",
        "options": [
          {
            "label": "A",
            "text": "Start changing code without checking"
          },
          {
            "label": "B",
            "text": "Check logs/monitoring, identify impact, inform concerned team, and apply controlled fix/rollback"
          },
          {
            "label": "C",
            "text": "Wait for next day"
          },
          {
            "label": "D",
            "text": "Delete recent files"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 16,
        "section": "Software Department Question Paper",
        "text": "What is the main purpose of input validation?",
        "options": [
          {
            "label": "A",
            "text": "To make UI colorful"
          },
          {
            "label": "B",
            "text": "To ensure only correct and safe data enters the system"
          },
          {
            "label": "C",
            "text": "To reduce screen size"
          },
          {
            "label": "D",
            "text": "To avoid using database"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 17,
        "section": "Software Department Question Paper",
        "text": "What will this condition check? if (age >= 18 && hasId == true)",
        "options": [
          {
            "label": "A",
            "text": "Age is below 18 or ID is missing"
          },
          {
            "label": "B",
            "text": "Age is 18 or above and ID is available"
          },
          {
            "label": "C",
            "text": "Only ID is checked"
          },
          {
            "label": "D",
            "text": "Only age below 18 is checked"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 18,
        "section": "Software Department Question Paper",
        "text": "You need to update only one field of an existing record through an API. Which method is commonly suitable?",
        "options": [
          {
            "label": "A",
            "text": "GET"
          },
          {
            "label": "B",
            "text": "PATCH"
          },
          {
            "label": "C",
            "text": "CONNECT"
          },
          {
            "label": "D",
            "text": "TRACE"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 19,
        "section": "Software Department Question Paper",
        "text": "A tester says the calculation is wrong. The expected total is 1180 including 18% GST on 1000. What should the correct formula be?",
        "options": [
          {
            "label": "A",
            "text": "1000 + 18"
          },
          {
            "label": "B",
            "text": "1000 * 18"
          },
          {
            "label": "C",
            "text": "1000 + (1000 * 18 / 100)"
          },
          {
            "label": "D",
            "text": "1000 / 18"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 20,
        "section": "Software Department Question Paper",
        "text": "You are reviewing code and find repeated logic copied in 5 places. What is the best approach?",
        "options": [
          {
            "label": "A",
            "text": "Leave it because it works"
          },
          {
            "label": "B",
            "text": "Create a reusable function/module to reduce duplication"
          },
          {
            "label": "C",
            "text": "Delete all repeated code without testing"
          },
          {
            "label": "D",
            "text": "Rename variables only"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      }
    ]
  },
  {
    "id": "software-tester",
    "title": "Software Testing Department Paper",
    "department": "Software Tester",
    "round": "department",
    "mode": "Online",
    "durationMinutes": 30,
    "totalMarks": 20,
    "passingMarks": 10,
    "description": "Software testing MCQ paper covering bug verification, negative testing, regression, severity, and test documentation.",
    "questions": [
      {
        "number": 1,
        "section": "Software Testing Department Question Paper",
        "text": "A developer says a bug is fixed. What should a tester do first before closing the bug?",
        "options": [
          {
            "label": "A",
            "text": "Close it immediately because developer has fixed it"
          },
          {
            "label": "B",
            "text": "Re-test the same steps in the correct environment and verify the expected result"
          },
          {
            "label": "C",
            "text": "Ask the client to check it"
          },
          {
            "label": "D",
            "text": "Create a new bug without checking"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 2,
        "section": "Software Testing Department Question Paper",
        "text": "A login form accepts email and password. Which is the best negative test case?",
        "options": [
          {
            "label": "A",
            "text": "Login with correct email and correct password"
          },
          {
            "label": "B",
            "text": "Login with invalid email format and check proper error message"
          },
          {
            "label": "C",
            "text": "Open the login page only"
          },
          {
            "label": "D",
            "text": "Click on the company logo"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 3,
        "section": "Software Testing Department Question Paper",
        "text": "You find a bug but cannot reproduce it again. What is the best action?",
        "options": [
          {
            "label": "A",
            "text": "Ignore it because it happened only once"
          },
          {
            "label": "B",
            "text": "Log it with available details, screenshots/logs, frequency, and continue trying to reproduce"
          },
          {
            "label": "C",
            "text": "Blame the developer"
          },
          {
            "label": "D",
            "text": "Mark it as blocker immediately"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 4,
        "section": "Software Testing Department Question Paper",
        "text": "What is regression testing?",
        "options": [
          {
            "label": "A",
            "text": "Testing only new features"
          },
          {
            "label": "B",
            "text": "Testing whether existing features still work after changes"
          },
          {
            "label": "C",
            "text": "Testing only UI color and font"
          },
          {
            "label": "D",
            "text": "Testing without test cases"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 5,
        "section": "Software Testing Department Question Paper",
        "text": "A field accepts age. Valid age range is 18 to 60. Which set is best for boundary value testing?",
        "options": [
          {
            "label": "A",
            "text": "18, 19, 59, 60"
          },
          {
            "label": "B",
            "text": "17, 18, 60, 61"
          },
          {
            "label": "C",
            "text": "20, 30, 40, 50"
          },
          {
            "label": "D",
            "text": "Only 18 and 60"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 6,
        "section": "Software Testing Department Question Paper",
        "text": "Which item should be included in a good bug report?",
        "options": [
          {
            "label": "A",
            "text": "Only bug title"
          },
          {
            "label": "B",
            "text": "Steps to reproduce, actual result, expected result, environment, severity, and screenshots/logs"
          },
          {
            "label": "C",
            "text": "Only developer name"
          },
          {
            "label": "D",
            "text": "Only final comment"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 7,
        "section": "Software Testing Department Question Paper",
        "text": "A production issue is reported by a client. What should a tester do first?",
        "options": [
          {
            "label": "A",
            "text": "Delete the test cases"
          },
          {
            "label": "B",
            "text": "Collect exact issue details, environment, user role, steps, screenshots/logs, and impact"
          },
          {
            "label": "C",
            "text": "Tell the client it is not possible"
          },
          {
            "label": "D",
            "text": "Wait until the next day"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 8,
        "section": "Software Testing Department Question Paper",
        "text": "What is the main purpose of smoke testing?",
        "options": [
          {
            "label": "A",
            "text": "To check every small detail"
          },
          {
            "label": "B",
            "text": "To quickly verify whether the main build is stable enough for further testing"
          },
          {
            "label": "C",
            "text": "To test only database speed"
          },
          {
            "label": "D",
            "text": "To replace all testing"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 9,
        "section": "Software Testing Department Question Paper",
        "text": "While testing an invoice form, the total amount is calculated incorrectly after discount and GST. What type of issue is this mainly?",
        "options": [
          {
            "label": "A",
            "text": "UI issue"
          },
          {
            "label": "B",
            "text": "Calculation/business logic issue"
          },
          {
            "label": "C",
            "text": "Spelling issue"
          },
          {
            "label": "D",
            "text": "Network issue"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 10,
        "section": "Software Testing Department Question Paper",
        "text": "Which is the best test data for checking a required mobile number field?",
        "options": [
          {
            "label": "A",
            "text": "Valid 10-digit number only"
          },
          {
            "label": "B",
            "text": "Blank value, less than 10 digits, more than 10 digits, letters, special characters, and valid 10-digit number"
          },
          {
            "label": "C",
            "text": "Company name"
          },
          {
            "label": "D",
            "text": "Only one random number"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 11,
        "section": "Software Testing Department Question Paper",
        "text": "A bug is marked as 'Cannot Reproduce' by the developer. What should the tester do?",
        "options": [
          {
            "label": "A",
            "text": "Close the bug without discussion"
          },
          {
            "label": "B",
            "text": "Add clear proof, environment details, exact steps, video/logs if available, and reassign politely"
          },
          {
            "label": "C",
            "text": "Create the same bug 10 times"
          },
          {
            "label": "D",
            "text": "Stop testing that module"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 12,
        "section": "Software Testing Department Question Paper",
        "text": "Which status should be used when a bug fix is checked and the issue no longer occurs?",
        "options": [
          {
            "label": "A",
            "text": "Closed/Verified"
          },
          {
            "label": "B",
            "text": "New"
          },
          {
            "label": "C",
            "text": "Rejected"
          },
          {
            "label": "D",
            "text": "Duplicate"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 13,
        "section": "Software Testing Department Question Paper",
        "text": "You are testing an API and it returns status code 500. What does it generally indicate?",
        "options": [
          {
            "label": "A",
            "text": "Successful request"
          },
          {
            "label": "B",
            "text": "Client-side validation error only"
          },
          {
            "label": "C",
            "text": "Server-side error"
          },
          {
            "label": "D",
            "text": "Page not found"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 14,
        "section": "Software Testing Department Question Paper",
        "text": "Which HTTP method is generally used to fetch data from an API?",
        "options": [
          {
            "label": "A",
            "text": "GET"
          },
          {
            "label": "B",
            "text": "POST"
          },
          {
            "label": "C",
            "text": "PUT"
          },
          {
            "label": "D",
            "text": "DELETE"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 15,
        "section": "Software Testing Department Question Paper",
        "text": "A tester has limited time before release. Which approach is best?",
        "options": [
          {
            "label": "A",
            "text": "Test random screens only"
          },
          {
            "label": "B",
            "text": "Prioritize critical user flows, high-risk areas, recent changes, and previously failed areas"
          },
          {
            "label": "C",
            "text": "Skip testing"
          },
          {
            "label": "D",
            "text": "Test only the easiest module"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 16,
        "section": "Software Testing Department Question Paper",
        "text": "What is the difference between severity and priority?",
        "options": [
          {
            "label": "A",
            "text": "Both are always same"
          },
          {
            "label": "B",
            "text": "Severity shows impact of defect; priority shows how soon it should be fixed"
          },
          {
            "label": "C",
            "text": "Priority shows tester name"
          },
          {
            "label": "D",
            "text": "Severity means design color"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 17,
        "section": "Software Testing Department Question Paper",
        "text": "A developer asks the tester to close a bug without proper verification because release is near. What should the tester do?",
        "options": [
          {
            "label": "A",
            "text": "Close it to save time"
          },
          {
            "label": "B",
            "text": "Verify properly and communicate risk if it cannot be tested in time"
          },
          {
            "label": "C",
            "text": "Delete the bug"
          },
          {
            "label": "D",
            "text": "Say yes but keep it open secretly"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 18,
        "section": "Software Testing Department Question Paper",
        "text": "Which testing type checks whether the application is easy and clear for users to use?",
        "options": [
          {
            "label": "A",
            "text": "Usability testing"
          },
          {
            "label": "B",
            "text": "Load testing"
          },
          {
            "label": "C",
            "text": "Database testing"
          },
          {
            "label": "D",
            "text": "Installation testing only"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 19,
        "section": "Software Testing Department Question Paper",
        "text": "A page works in Chrome but fails in Firefox. What type of testing can identify this issue?",
        "options": [
          {
            "label": "A",
            "text": "Compatibility testing"
          },
          {
            "label": "B",
            "text": "Unit testing only"
          },
          {
            "label": "C",
            "text": "Smoke testing only"
          },
          {
            "label": "D",
            "text": "Alpha testing"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 20,
        "section": "Software Testing Department Question Paper",
        "text": "You notice the same defect pattern in many screens. What is the best tester response?",
        "options": [
          {
            "label": "A",
            "text": "Report one clear bug with affected areas and examples, and mention the pattern"
          },
          {
            "label": "B",
            "text": "Ignore all screens"
          },
          {
            "label": "C",
            "text": "Only tell one developer verbally"
          },
          {
            "label": "D",
            "text": "Wait for client complaint"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      }
    ]
  },
  {
    "id": "support",
    "title": "Support Department Paper",
    "department": "Support",
    "round": "department",
    "mode": "Online",
    "durationMinutes": 30,
    "totalMarks": 20,
    "passingMarks": 10,
    "description": "Support MCQ paper covering ticketing, communication, troubleshooting, follow-up, and security discipline.",
    "questions": [
      {
        "number": 1,
        "section": "Support Department Question Paper",
        "text": "A customer says, 'The system is not working.' What should be your first response?",
        "options": [
          {
            "label": "A",
            "text": "Tell them to restart and close the call"
          },
          {
            "label": "B",
            "text": "Ask clear questions to understand the exact issue"
          },
          {
            "label": "C",
            "text": "Inform the manager immediately without checking"
          },
          {
            "label": "D",
            "text": "Tell them it is not your responsibility"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 2,
        "section": "Support Department Question Paper",
        "text": "What is the main purpose of a support ticket?",
        "options": [
          {
            "label": "A",
            "text": "To increase paperwork"
          },
          {
            "label": "B",
            "text": "To record, track, and resolve customer/user issues"
          },
          {
            "label": "C",
            "text": "To delay the work"
          },
          {
            "label": "D",
            "text": "To avoid speaking with users"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 3,
        "section": "Support Department Question Paper",
        "text": "A user reports that they cannot log in. Which detail should you check first?",
        "options": [
          {
            "label": "A",
            "text": "Their designation"
          },
          {
            "label": "B",
            "text": "Whether the username/password or access status is correct"
          },
          {
            "label": "C",
            "text": "Their salary details"
          },
          {
            "label": "D",
            "text": "The company website design"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 4,
        "section": "Support Department Question Paper",
        "text": "What does SLA usually mean in support work?",
        "options": [
          {
            "label": "A",
            "text": "Sales Lead Agreement"
          },
          {
            "label": "B",
            "text": "Service Level Agreement"
          },
          {
            "label": "C",
            "text": "System Login Access"
          },
          {
            "label": "D",
            "text": "Support Leave Approval"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 5,
        "section": "Support Department Question Paper",
        "text": "If multiple issues come together, which one should be handled first?",
        "options": [
          {
            "label": "A",
            "text": "The easiest issue"
          },
          {
            "label": "B",
            "text": "The oldest issue only"
          },
          {
            "label": "C",
            "text": "The issue with the highest business impact/urgency"
          },
          {
            "label": "D",
            "text": "The issue from your favorite user"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 6,
        "section": "Support Department Question Paper",
        "text": "A customer is angry because the same issue happened again. What should you do?",
        "options": [
          {
            "label": "A",
            "text": "Argue and prove your point"
          },
          {
            "label": "B",
            "text": "Listen calmly, apologize for inconvenience, and investigate properly"
          },
          {
            "label": "C",
            "text": "Disconnect the call"
          },
          {
            "label": "D",
            "text": "Tell them to adjust"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 7,
        "section": "Support Department Question Paper",
        "text": "Which is the best way to close a support ticket?",
        "options": [
          {
            "label": "A",
            "text": "Close it when you feel it is solved"
          },
          {
            "label": "B",
            "text": "Close it after confirming resolution and adding proper notes"
          },
          {
            "label": "C",
            "text": "Close it without informing the user"
          },
          {
            "label": "D",
            "text": "Close all old tickets together"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 8,
        "section": "Support Department Question Paper",
        "text": "A user says the printer is not printing. What is a logical first-level check?",
        "options": [
          {
            "label": "A",
            "text": "Replace the computer immediately"
          },
          {
            "label": "B",
            "text": "Check power, connection, paper, and printer status"
          },
          {
            "label": "C",
            "text": "Delete all printer drivers immediately"
          },
          {
            "label": "D",
            "text": "Escalate without checking anything"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 9,
        "section": "Support Department Question Paper",
        "text": "What should you do if you do not know the answer to a user's issue?",
        "options": [
          {
            "label": "A",
            "text": "Guess and give a random answer"
          },
          {
            "label": "B",
            "text": "Say you will check, then find the correct solution or escalate"
          },
          {
            "label": "C",
            "text": "Ignore the request"
          },
          {
            "label": "D",
            "text": "Tell the user to search online"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 10,
        "section": "Support Department Question Paper",
        "text": "Which of the following is the best example of good support documentation?",
        "options": [
          {
            "label": "A",
            "text": "Issue solved"
          },
          {
            "label": "B",
            "text": "User called"
          },
          {
            "label": "C",
            "text": "Login failed due to inactive account; account activated and user confirmed login"
          },
          {
            "label": "D",
            "text": "Done"
          }
        ],
        "correctAnswer": "C",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 11,
        "section": "Support Department Question Paper",
        "text": "A user reports slow internet. Which question is useful first?",
        "options": [
          {
            "label": "A",
            "text": "What is your favorite browser?"
          },
          {
            "label": "B",
            "text": "Is the issue on one system or all systems?"
          },
          {
            "label": "C",
            "text": "Who approved your leave?"
          },
          {
            "label": "D",
            "text": "What is your monthly salary?"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 12,
        "section": "Support Department Question Paper",
        "text": "What is escalation in support?",
        "options": [
          {
            "label": "A",
            "text": "Ignoring a difficult issue"
          },
          {
            "label": "B",
            "text": "Transferring an issue to a higher/technical level when it cannot be resolved at current level"
          },
          {
            "label": "C",
            "text": "Closing a ticket forcefully"
          },
          {
            "label": "D",
            "text": "Arguing with the user"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 13,
        "section": "Support Department Question Paper",
        "text": "Which behavior is most important while talking to a user?",
        "options": [
          {
            "label": "A",
            "text": "Speaking fast"
          },
          {
            "label": "B",
            "text": "Being polite, clear, and patient"
          },
          {
            "label": "C",
            "text": "Using complex technical words"
          },
          {
            "label": "D",
            "text": "Ending the call quickly"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 14,
        "section": "Support Department Question Paper",
        "text": "A user sends a screenshot of an error. What should you do?",
        "options": [
          {
            "label": "A",
            "text": "Ignore the screenshot"
          },
          {
            "label": "B",
            "text": "Review the error message, ask for required details, and troubleshoot"
          },
          {
            "label": "C",
            "text": "Reply only with 'OK'"
          },
          {
            "label": "D",
            "text": "Delete the message"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 15,
        "section": "Support Department Question Paper",
        "text": "What does first response time mean?",
        "options": [
          {
            "label": "A",
            "text": "Time taken to fully solve the issue"
          },
          {
            "label": "B",
            "text": "Time taken to give the first reply/acknowledgement"
          },
          {
            "label": "C",
            "text": "Time taken to create salary slip"
          },
          {
            "label": "D",
            "text": "Time taken to shut down the system"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 16,
        "section": "Support Department Question Paper",
        "text": "A support executive should update the ticket status because:",
        "options": [
          {
            "label": "A",
            "text": "It helps tracking and transparency"
          },
          {
            "label": "B",
            "text": "It is only for decoration"
          },
          {
            "label": "C",
            "text": "It wastes time"
          },
          {
            "label": "D",
            "text": "It is not required after speaking with the user"
          }
        ],
        "correctAnswer": "A",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 17,
        "section": "Support Department Question Paper",
        "text": "A customer asks for a feature that is not available in the system. What should you do?",
        "options": [
          {
            "label": "A",
            "text": "Promise that it will be done today"
          },
          {
            "label": "B",
            "text": "Clearly explain current limitation and note/share the requirement with the concerned team"
          },
          {
            "label": "C",
            "text": "Say yes without checking"
          },
          {
            "label": "D",
            "text": "Ignore the customer"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 18,
        "section": "Support Department Question Paper",
        "text": "Which of the following is a good troubleshooting approach?",
        "options": [
          {
            "label": "A",
            "text": "Assume the issue without checking"
          },
          {
            "label": "B",
            "text": "Check step by step and verify after each action"
          },
          {
            "label": "C",
            "text": "Change many settings at once"
          },
          {
            "label": "D",
            "text": "Restart everything every time"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 19,
        "section": "Support Department Question Paper",
        "text": "Why is follow-up important in support?",
        "options": [
          {
            "label": "A",
            "text": "To disturb the user"
          },
          {
            "label": "B",
            "text": "To confirm the issue is resolved and maintain trust"
          },
          {
            "label": "C",
            "text": "To increase ticket count"
          },
          {
            "label": "D",
            "text": "To avoid documentation"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      },
      {
        "number": 20,
        "section": "Support Department Question Paper",
        "text": "A user asks you to share another employee's password. What should you do?",
        "options": [
          {
            "label": "A",
            "text": "Share it if they are senior"
          },
          {
            "label": "B",
            "text": "Refuse politely and follow security/reset process"
          },
          {
            "label": "C",
            "text": "Send it on WhatsApp"
          },
          {
            "label": "D",
            "text": "Ask them to guess it"
          }
        ],
        "correctAnswer": "B",
        "scored": true,
        "requiresReason": false
      }
    ]
  }
] as ExamPaper[];

export const ASSESSMENT_PAPER = EXAM_PAPERS.find((paper) => paper.id === "assessment")!;

export const DEPARTMENT_PAPERS = EXAM_PAPERS.filter((paper) => paper.round === "department");

export const getDepartmentPaper = (department: string) =>
  DEPARTMENT_PAPERS.find((paper) => paper.department === department) ?? DEPARTMENT_PAPERS[0];

export const getPaperById = (paperId: string) => EXAM_PAPERS.find((paper) => paper.id === paperId);

export const scorePaper = (paper: ExamPaper, answers: Record<number, ExamOptionLabel>) => {
  const scoredQuestions = paper.questions.filter((question) => question.scored && question.correctAnswer);
  const correct = scoredQuestions.filter((question) => answers[question.number] === question.correctAnswer).length;
  return {
    correct,
    total: scoredQuestions.length,
    percentage: scoredQuestions.length ? Math.round((correct / scoredQuestions.length) * 100) : 0,
    passed: correct >= paper.passingMarks,
  };
};
