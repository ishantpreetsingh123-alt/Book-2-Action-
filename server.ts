import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Resolve paths safely for ES modules or CommonJS environments.
const resolvedFilename = typeof import.meta !== "undefined" && import.meta.url
  ? fileURLToPath(import.meta.url)
  : "";

const resolvedDirname = resolvedFilename 
  ? path.dirname(resolvedFilename) 
  : "";

const atomicHabitsDemoData = {
  title: "Atomic Habits",
  author: "James Clear",
  tagline: "An Easy & Proven Way to Build Good Habits & Break Bad Ones",
  summary: {
    mainIdea: "Small lifestyle changes compounded over time produce radical personal transformation.",
    coreThesis: "You do not rise to the level of your goals. You fall to the level of your systems. The key to lasting change is focusing on who you wish to become (identity-based habits) rather than what you want to achieve.",
    keyBonusQuote: "Every action you take is a vote for the type of person you wish to become.",
    keyLessons: [
      { title: "The Compounding Power of 1%", description: "Improving by just 1% every day results in being 37 times better by the end of one single year. Small steps compound magnificently." },
      { title: "Identity-Based Habits", description: "The most effective way to change habits is to focus not on what you want to achieve, but on WHO you wish to become. Action follows identity." },
      { title: "The Four Laws of Behavior Change", description: "To build a great habit: Make it Obvious, Make it Attractive, Make it Easy, Make it Satisfying. To break a bad one, do the exact inverse." },
      { title: "Environment Over Willpower", description: "Environment is the invisible hand that shapes human behavior. Redesign your workspace so good habit cues are highly visible and bad habit cues are hidden." }
    ],
    importantFrameworks: [
      { name: "The 4 Laws of Behavior Change", description: "A mental model matching human neurology (Cue -> Craving -> Response -> Reward).", howToApply: "For positive habits: Place cues in plain sight, stack them with temptations, lower friction to start, and reward yourself immediately." },
      { name: "Habit Stacking", description: "Pairing a new desired habit with a highly stable, current daily habit.", howToApply: "Use the physical formula: 'After [Current Stable Habit], I will [New Positive Habit]' to bind cues." },
      { name: "The Goldilocks Rule", description: "Peak motivation is achieved when working on challenges of just-manageable difficulty.", howToApply: "Avoid boredom (tasks too easy) and anxiety (tasks too hard). Keep challenges at +/- 10% of current abilities." }
    ],
    practicalInsights: [
      "Friction is the ultimate barrier. Reduce the physical steps between you and a positive action.",
      "Never miss twice. Missing once is an accident. Missing twice is the start of a brand new bad habit.",
      "Track your achievements visually using calendars or trackers to create immediate satisfaction."
    ],
    actionableTakeaways: [
      "Redesign your workspace so your instruments, books, or water bottles are in direct eyesight.",
      "Automate key tasks (bill payments, healthy food deliveries) so success is the default state.",
      "Form a strict accountability contract with a partner so slipping has immediate social/financial costs."
    ]
  },
  actionPlan: {
    weeks: [
      {
        weekNumber: 1,
        weekTitle: "Foundation & Cue Optimization",
        days: [
          { dayNumber: 1, dailyObjective: "Audit Existing Tasks & Habits", actionSteps: ["Write down all your daily behaviors on a Habits Scorecard.", "Mark them positive (+), negative (-), or neutral (=) based on long-term utility."], estimatedTime: "15 mins", expectedOutcome: "Complete conscious awareness of automatic daily routines." },
          { dayNumber: 2, dailyObjective: "Identity Declaration Definition", actionSteps: ["Define the type of person who achieves your major goals (e.g., 'a deep thinker', 'a daily runner').", "Write this identity statement on index cards."], estimatedTime: "10 mins", expectedOutcome: "Shift in motivation core from outcome-based to identity-based." },
          { dayNumber: 3, dailyObjective: "Establish Your First Habit Stack", actionSteps: ["Select one habit you want to build (e.g., reading metadata).", "Stack it with a stable anchor: 'After [Inhaling Morning Coffee], I will [Read 1 Page].'"], estimatedTime: "5 mins", expectedOutcome: "A clear, concrete trigger established in memory." },
          { dayNumber: 4, dailyObjective: "Redesign Cue Visibility (Positive)", actionSteps: ["Choose physical cues for your habit and place them on your direct visual path.", "E.g., place your notebook directly on your physical keyboard."], estimatedTime: "20 mins", expectedOutcome: "Your environment begins working with you, not against you." },
          { dayNumber: 5, dailyObjective: "Conceal Cue Friction (Negative)", actionSteps: ["Identify one negative trigger in your home office.", "Physically move it to a closed cabinet or drawer (e.g. video game controller)."], estimatedTime: "15 mins", expectedOutcome: "Reduced probability of unconscious distraction." },
          { dayNumber: 6, dailyObjective: "The 2-Minute Gateway Blueprint", actionSteps: ["Scale down your habit until it takes 120 seconds or less (e.g., 'Do 2 pushups', 'Open index file').", "Commit to doing only this short gateway today."], estimatedTime: "5 mins", expectedOutcome: "Establish the sequence entry point without mental friction." },
          { dayNumber: 7, dailyObjective: "First-Week Review & Reward Check", actionSteps: ["Log your first week scorecard.", "Treat yourself to a healthy instant reward to link your brain with visual achievement."], estimatedTime: "15 mins", expectedOutcome: "Neurological positive reinforcement of the new cues." }
        ]
      },
      {
        weekNumber: 2,
        weekTitle: "Craving Spark & response Minimization",
        days: [
          { dayNumber: 8, dailyObjective: "Temptation Bundling Audit", actionSteps: ["Pair an action you need to do with an action you deeply want to do.", "E.g., only listen to your favorite podcast while doing the dishes."], estimatedTime: "10 mins", expectedOutcome: "Enhanced dopamine release associated with necessary tasks." },
          { dayNumber: 9, dailyObjective: "Culture Association Alignment", actionSteps: ["Identify a team, forum, or book club where your target habit is the normal group standard.", "Join this online or offline group."], estimatedTime: "20 mins", expectedOutcome: "Social identity pressure begins assisting your compound actions." },
          { dayNumber: 10, dailyObjective: "Pre-Habit Ritual Formulation", actionSteps: ["Create a physical motivation ritual by doing things you enjoy immediately before a hard activity.", "E.g. take 3 deep breaths and write 1 word."], estimatedTime: "5 mins", expectedOutcome: "Mind and body primed for focus on cue." },
          { dayNumber: 11, dailyObjective: "Eliminate Startup Friction", actionSteps: ["Set up your physical space the night before so starting is mathematically frictionless.", "Prepare your desk layout completely."], estimatedTime: "15 mins", expectedOutcome: "Clean transition from waking to focus with zero decisions." },
          { dayNumber: 12, dailyObjective: "Gateway Habit Persistence", actionSteps: ["Execute your 2-minute habit again. Do not extend it. Focus on building the identity of showing up."], estimatedTime: "2 mins", expectedOutcome: "An unshakeable daily habit entry point." },
          { dayNumber: 13, dailyObjective: "The Friction Cost Equation", actionSteps: ["Write down the true cost of bad automated habits over the next 5 years.", "Contrast with 1% improvements."], estimatedTime: "15 mins", expectedOutcome: "Emotional and logical clarity to overcome friction." },
          { dayNumber: 14, dailyObjective: "Visualize Response Tracking", actionSteps: ["Mark your calendar with clear, visually stimulating checks for completed days.", "Avoid breaking the chain."], estimatedTime: "5 mins", expectedOutcome: "Immediate visual gratification dashboard ready for look." }
        ]
      },
      {
        weekNumber: 3,
        weekTitle: "Reward Integration & System Optimization",
        days: [
          { dayNumber: 15, dailyObjective: "Increase friction of distractions", actionSteps: ["Make bad habits incredibly difficult.", "Unplug cables, remove batteries, or block distracting URLs using tools."], estimatedTime: "20 mins", expectedOutcome: "Inability to slip into bad habits without manual labor." },
          { dayNumber: 16, dailyObjective: "Instant Gratification Transfer", actionSteps: ["Set up a virtual money transfer account.", "Transfer $5 to your leisure fund for every single habit completed successfully."], estimatedTime: "10 mins", expectedOutcome: "Brain enjoys immediate material proof of habit value." },
          { dayNumber: 17, dailyObjective: "Streamlining Logging Routines", actionSteps: ["Make habit-logging effortless.", "If it takes more than 15 seconds to log, move to a single tap button or physical chart."], estimatedTime: "10 mins", expectedOutcome: "Lowered systems overhead." },
          { dayNumber: 18, dailyObjective: "Develop the Never-Miss-Twice Plan", actionSteps: ["Determine what to do when life disrupts you.", "E.g., 'If I miss gym because of meeting, I will do 15 air squats immediately after.'"], estimatedTime: "10 mins", expectedOutcome: "A bulletproof contingency plan preventing bad habit forming." },
          { dayNumber: 19, dailyObjective: "Social Proof Contract", actionSteps: ["Establish an accountability partner.", "Express your weekly goal clearly and authorize them to levy gentle penalties for failure."], estimatedTime: "15 mins", expectedOutcome: "Heightened positive stakes through accountability." },
          { dayNumber: 20, dailyObjective: "Calibrate Goldilocks Difficulty", actionSteps: ["Audit if the habit has become boring.", "If yes, increase intensity or focus by 10%. If too difficult, scale back slightly."], estimatedTime: "15 mins", expectedOutcome: "Sustained peak motivation and engagement state." },
          { dayNumber: 21, dailyObjective: "Bi-Weekly Habits Retrospective", actionSteps: ["Study which stacked anchors fired successfully and which ones failed.", "Adjust trigger points."], estimatedTime: "20 mins", expectedOutcome: "Real-world adaptation of behaviour systems." }
        ]
      },
      {
        weekNumber: 4,
        weekTitle: "Personal Mastery & Identity Integration",
        days: [
          { dayNumber: 22, dailyObjective: "Acknowledge Identity Wins", actionSteps: ["Review evidence of your actions from weeks 1-3.", "Draft a note celebrating how your actions validated your new identity."], estimatedTime: "15 mins", expectedOutcome: "Deep structural self-esteem building." },
          { dayNumber: 23, dailyObjective: "Automate Reminders & Alerts", actionSteps: ["Schedule smart alarms, calendar events, or smart lighting to signal habit stacks automatically."], estimatedTime: "15 mins", expectedOutcome: "Reduced reliance on internal willpower cues." },
          { dayNumber: 24, dailyObjective: "Draft the Habit Contract", actionSteps: ["Put your commitment into writing.", "Add visual signatures, accountability witnesses, and clear outcomes for consistency."], estimatedTime: "20 mins", expectedOutcome: "A formal personal compact binding your actions." },
          { dayNumber: 25, dailyObjective: "Behavior Substitution Mastery", actionSteps: ["When bad habit cue triggers, substitute a tiny constructive action that delivers target rewards."], estimatedTime: "20 mins", expectedOutcome: "Upgraded behavioral loops with zero deficit feeling." },
          { dayNumber: 26, dailyObjective: "Anchor Reflection Systems", actionSteps: ["Designate a repeating weekly slot for habit review.", "Mark your schedule for every Sunday afternoon."], estimatedTime: "5 mins", expectedOutcome: "Long-term system maintainability set." },
          { dayNumber: 27, dailyObjective: "Formulate Next Compound habit", actionSteps: ["With this habit secure, choose a secondary habit to stack with your successful master routine."], estimatedTime: "15 mins", expectedOutcome: "Infinite progression ladder unlocked." },
          { dayNumber: 28, dailyObjective: "Anchor Habit Celebration", actionSteps: ["Treat yourself to a grand reward for completing 28 continuous days.", "Feel the power of compounding results."], estimatedTime: "30 mins", expectedOutcome: "High dopamine milestone completion anchor." }
        ]
      }
    ]
  },
  concepts: [
    { conceptName: "The 1% Rule", explanation: "Small incremental daily additions build massive compound gains over time.", importanceScore: 94, practicalApplication: "Never stress about quick gains; improve incrementally and compound habits.", relatedConcepts: ["Compounding Interest", "Habit Stacking"] },
    { conceptName: "Systems vs Goals", explanation: "Goals define your target results; systems define the actual actions leading to those results.", importanceScore: 98, practicalApplication: "Instead of focusing on writing a book, focus on daily writing habits.", relatedConcepts: ["Identity-Based Habits", "Atomic Actions"] },
    { conceptName: "Identity-First Habits", explanation: "Habits are deeply anchored to self-image. Focus on the WHO first, not the WHAT.", importanceScore: 100, practicalApplication: "Remind yourself: 'Every daily action is a vote for the person I want to be.'", relatedConcepts: ["The Goldilocks Rule", "Cognitive Alignment"] },
    { conceptName: "Gateway Practices", explanation: "Scaling behaviors down so they require less than 2 minutes of willpower to initiate.", importanceScore: 89, practicalApplication: "Always optimize for the first two minutes of any action.", relatedConcepts: ["Friction Management", "Anchor Trigger"] }
  ],
  flowchart: {
    nodes: [
      { id: "ah-1", label: "Atomic Habits Philosophy", type: "root", description: "The central thesis that marginal gains yield radical long-term compounding transformation." },
      { id: "ah-2", label: "Neurological Habit Loop", type: "chapter", description: "Every habit is an automated response to a physical trigger: Cue -> Craving -> Response -> Reward." },
      { id: "ah-3", label: "1st Law: Make It Obvious", type: "concept", description: "Use scorecard methods, clear visual prompts, and physical Habit Stacking formulas." },
      { id: "ah-4", label: "2nd Law: Make It Attractive", type: "concept", description: "Bundle temptations together and associate with normal community behaviors." },
      { id: "ah-5", label: "3rd Law: Make It Easy", type: "concept", description: "Employ the 2-Minute Gateway Rule and optimize your room environment design." },
      { id: "ah-6", label: "4th Law: Make It Satisfying", type: "concept", description: "Use immediate rewards and visual checklists so progress feels chemically rewarding." },
      { id: "ah-7", label: "Systems Architecture", type: "chapter", description: "Relying on physical environment design and habits scorecard rather than cognitive willpower." },
      { id: "ah-8", label: "Identity Mastery", type: "action", description: "Permanent behavior shifts compounding to forge automatic, self-reinforcing identity loops." }
    ],
    edges: [
      { from: "ah-1", to: "ah-2", label: "Analyzes" },
      { from: "ah-2", to: "ah-3", label: "Step 1" },
      { from: "ah-2", to: "ah-4", label: "Step 2" },
      { from: "ah-2", to: "ah-5", label: "Step 3" },
      { from: "ah-2", to: "ah-6", label: "Step 4" },
      { from: "ah-1", to: "ah-7", label: "Prerequisite" },
      { from: "ah-7", to: "ah-8", label: "Produces" }
    ]
  }
};

const bookAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The clear official book title" },
    author: { type: Type.STRING, description: "The author(s) of the book" },
    tagline: { type: Type.STRING, description: "A punchy summary tagline of 8-12 words of the book" },
    summary: {
      type: Type.OBJECT,
      properties: {
        mainIdea: { type: Type.STRING, description: "The main idea of the book in 2-3 detailed sentences." },
        coreThesis: { type: Type.STRING, description: "The core thesis behind why the author wrote the book." },
        keyBonusQuote: { type: Type.STRING, description: "A highly inspiration quote from the book or inspired by the book's core philosophy." },
        keyLessons: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Actionable summary title of the lesson" },
              description: { type: Type.STRING, description: "Detailed 1-2 sentence description explaining the lesson's background." }
            },
            required: ["title", "description"]
          }
        },
        importantFrameworks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "The developer or author mental model name (e.g. Habit Stacking, Pareto Principle, Eisenhower Matrix)." },
              description: { type: Type.STRING, description: "What is this framework in clear terms." },
              howToApply: { type: Type.STRING, description: "Concrete, single sentence guide on how to implement this model starting tomorrow." }
            },
            required: ["name", "description", "howToApply"]
          }
        },
        practicalInsights: {
          type: Type.ARRAY,
          items: { type: Type.STRING, description: "An empirical, actionable insight regarding behavior or strategies in the book." }
        },
        actionableTakeaways: {
          type: Type.ARRAY,
          items: { type: Type.STRING, description: "A direct immediate task the reader can execute." }
        }
      },
      required: ["mainIdea", "coreThesis", "keyLessons", "importantFrameworks", "practicalInsights", "actionableTakeaways"]
    },
    actionPlan: {
      type: Type.OBJECT,
      properties: {
        weeks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              weekNumber: { type: Type.INTEGER, description: "Week index from 1 to 4" },
              weekTitle: { type: Type.STRING, description: "A high level thematic title for this week's goals (e.g. Week 1 - Foundation, Week 2 - Implementation, etc.)" },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.INTEGER, description: "The day number, ranging sequentially from 1 to 28" },
                    dailyObjective: { type: Type.STRING, description: "The main focus of today's implementation task" },
                    actionSteps: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING, description: "Specific steps to execute today" }
                    },
                    estimatedTime: { type: Type.STRING, description: "Required time commit (e.g. '15 mins', '1 hour', '10 mins')" },
                    expectedOutcome: { type: Type.STRING, description: "The psychological or practical result achieved upon completion" }
                  },
                  required: ["dayNumber", "dailyObjective", "actionSteps", "estimatedTime", "expectedOutcome"]
                }
              }
            },
            required: ["weekNumber", "weekTitle", "days"]
          }
        }
      },
      required: ["weeks"]
    },
    concepts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          conceptName: { type: Type.STRING, description: "Name of the core concept" },
          explanation: { type: Type.STRING, description: "What makes this concept tick in simple language" },
          importanceScore: { type: Type.INTEGER, description: "A relative priority/importance score from 1 to 100" },
          practicalApplication: { type: Type.STRING, description: "How a professional applies this concept to their workspace or life" },
          relatedConcepts: {
            type: Type.ARRAY,
            items: { type: Type.STRING, description: "One or two related concepts from the book" }
          }
        },
        required: ["conceptName", "explanation", "importanceScore", "practicalApplication", "relatedConcepts"]
      }
    },
    flowchart: {
      type: Type.OBJECT,
      properties: {
        nodes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Unique string id (e.g. 'n-1', 'node-chapter-1')" },
              label: { type: Type.STRING, description: "The short visual title of the node (maximum 4 words)" },
              type: { type: Type.STRING, description: "Must be exactly 'root' or 'chapter' or 'concept' or 'action'" },
              description: { type: Type.STRING, description: "Detailed summary explaining this specific concept node when hovered or viewed." }
            },
            required: ["id", "label", "type", "description"]
          }
        },
        edges: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              from: { type: Type.STRING, description: "The source node's id" },
              to: { type: Type.STRING, description: "The destination node's id" },
              label: { type: Type.STRING, description: "Short association label (e.g. 'Leads to', 'Enables', 'Validates', 'Part 1')" }
            },
            required: ["from", "to"]
          }
        }
      },
      required: ["nodes", "edges"]
    }
  },
  required: ["title", "author", "tagline", "summary", "actionPlan", "concepts", "flowchart"]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // Initialize Gemini if available
  let genAI: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
      console.log("Gemini API successfully initialized on Express Server.");
    } catch (e) {
      console.error("Failed to initialize Gemini API Client: ", e);
    }
  } else {
    console.warn("No GEMINI_API_KEY found in process.env. Using developer warning mode.");
  }

  // API router endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Get Demo Book analysis static payload
  app.get("/api/demo", (req, res) => {
    res.json(atomicHabitsDemoData);
  });

  // Action Analysis
  app.post("/api/analyze", async (req, res) => {
    try {
      const { bookTitle } = req.body;
      if (!bookTitle || typeof bookTitle !== "string" || !bookTitle.trim()) {
        return res.status(400).json({ error: "Book title remains a required field." });
      }

      console.log(`Received analysis request for book: "${bookTitle}"`);

      // Fallback demo matching, to ensure flawless behavior on general queries if keys aren't set up yet,
      // or to save API quotas when they type "Atomic Habits".
      const normalizedTitle = bookTitle.toLowerCase().trim();
      if (normalizedTitle.includes("atomic habit") || normalizedTitle === "demo") {
        console.log("Serving precompiled high-fidelity Atomic Habits dataset.");
        return res.json(atomicHabitsDemoData);
      }

      if (!process.env.GEMINI_API_KEY || !genAI) {
        return res.status(503).json({
          error: "GEMINI_API_KEY is not configured on the server. Please check the Secrets panel in Settings.",
          isDemoOptionAvailable: true,
          demoData: atomicHabitsDemoData
        });
      }

      const prompt = `You are an expert literary researcher, master business coach, and educator.
Your task is to comprehensively analyze the popular non-fiction or professional business book: "${bookTitle}".
Create an extremely deep, actionable, real-world analytical breakdown that fits the Book2Action product.
Provide the final response strictly matching the schema layout provided.
Ensure that the 30-Day Action Plan is sequential, realistic, has 4 distinct weeks, and incorporates 7 sequential days per week (making exactly 28 days total).
Ensure the flowchart nodes build a beautiful, logical diagram starting with a single central 'root' node of the book, which links to 3-5 'chapter' nodes, which then link to downstream 'concept' and 'action' nodes. Keep id values clean.
Make sure the tagline captures the soul of the book in a beautiful, marketing-ready high impact slogan. Enjoy!`;

      console.log("Querying Gemini 3.5 Flash Model...");
      const response = await genAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: bookAnalysisSchema,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Received an empty content payload from Gemini model.");
      }

      try {
        const parsedData = JSON.parse(responseText);
        return res.json(parsedData);
      } catch (parseError) {
        console.error("Failed to parse JSON result from Gemini:", responseText);
        return res.status(502).json({
          error: "Received irregular output format from AI. Please try editing the book title slightly.",
          rawText: responseText
        });
      }
    } catch (err: any) {
      console.error("Error while analyzing book ideas: ", err);
      return res.status(500).json({
        error: err.message || "An unpreventable error happened during AI content processing."
      });
    }
  });

  // Serve static dist folder or mount Vite middlewares
  if (process.env.NODE_ENV !== "production") {
    console.log("Running in development mode. Mounting Vite Dev Tools middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Running in production mode. Serving pre-compiled static content...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Book2Action Server running locally on port ${PORT}`);
  });
}

startServer();
