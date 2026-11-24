// Generated from quiz/quiz.json by site/build.py. Edit the JSON, not this file.
window.QUIZ = {
 "meta": {
  "name": "Maker Type",
  "statements": 16,
  "note": "Source of truth for the quiz copy. The build reads this file. Rewritten on Nov 23 as rated statements (quiz/QUESTIONS.md, reports/Quiz research 2.md). The scene version is in quiz/quiz.v3-scenes-backup.json.",
  "scoring": {
   "scale": "Disagree is on the left, Agree on the right. Disagree a lot -2, disagree a little -1, in the middle 0, agree a little 1, agree a lot 2",
   "lean": "Making total minus ordering total. 0 to 4 between, 5 to 8 a slight lean, 9 or more a lean",
   "role": "People: add the people statements (one counts the other way). Plan: the same. 3 or more earns that end. The stronger pair wins, a tie goes to people. Neither earns All Rounder",
   "report": "counts of statements agreed with, never a percentage"
  },
  "limits": {
   "hero": 10,
   "statement": 10,
   "line": 14,
   "short": 3,
   "resultAboveFold": 60,
   "bubble": 4
  },
  "evidenceNote": "One contrast has direct support: liking to make things people look at, against being fine with numbers and records. The figure behind it is our own calculation from an open online dataset, not a published result. The statements are adapted from open and public-domain items, reworded, and untested on first-years. Ten statements give a rough lean. Three give only a hint about how someone works."
 },
 "groups": {
  "making": {
   "label": "Making things people look at",
   "counts": "Plus counts toward Design.",
   "pos": "Design",
   "total": "Design"
  },
  "ordering": {
   "label": "Numbers, lists and schedules",
   "counts": "Plus counts toward Information Systems.",
   "pos": "IS",
   "total": "IS"
  },
  "people": {
   "label": "With people or on your own",
   "counts": "Plus is toward the group: Facilitator. Minus is toward working alone: Soloist.",
   "pos": "Facilitator",
   "neg": "Soloist",
   "total": "People"
  },
  "plan": {
   "label": "Plan it or wing it",
   "counts": "Plus is toward planning: Planner. Minus is toward starting first: Improviser.",
   "pos": "Planner",
   "neg": "Improviser",
   "total": "Plan"
  }
 },
 "scale": {
  "left": "Disagree",
  "right": "Agree",
  "agree": "Agree",
  "disagree": "Disagree",
  "spots": [
   {
    "v": -2,
    "label": "Disagree a lot",
    "cap": ""
   },
   {
    "v": -1,
    "label": "Disagree a little",
    "cap": "a little"
   },
   {
    "v": 0,
    "label": "In the middle",
    "cap": "middle"
   },
   {
    "v": 1,
    "label": "Agree a little",
    "cap": "a little"
   },
   {
    "v": 2,
    "label": "Agree a lot",
    "cap": ""
   }
  ]
 },
 "statements": [
  {
   "id": "D1",
   "group": "making",
   "dir": 1,
   "text": "You'd enjoy making the poster for a friend's event.",
   "short": "The poster",
   "source": "O*NET \"Design artwork for magazines\"",
   "licence": "O*NET open with credit"
  },
  {
   "id": "P1",
   "group": "people",
   "dir": 1,
   "text": "You get people talking when a group goes quiet.",
   "short": "Quiet group",
   "source": "IPIP \"Start conversations\"",
   "licence": "Public domain"
  },
  {
   "id": "I1",
   "group": "ordering",
   "dir": 1,
   "text": "You like keeping a list up to date.",
   "short": "The list",
   "source": "ORVIS \"Keep detailed records\". O*NET \"Maintain employee records\"",
   "licence": "Public domain. O*NET open with credit"
  },
  {
   "id": "S1",
   "group": "plan",
   "dir": 1,
   "text": "You make a plan before you start.",
   "short": "Plan first",
   "source": "IPIP \"Do things according to a plan\"",
   "licence": "Public domain"
  },
  {
   "id": "D2",
   "group": "making",
   "dir": 1,
   "text": "You rearrange a room until it looks right.",
   "short": "The room",
   "source": "ORVIS \"Redecorate one's house\"",
   "licence": "Public domain"
  },
  {
   "id": "I2",
   "group": "ordering",
   "dir": 1,
   "text": "You'd enjoy working out the budget for a trip.",
   "short": "The budget",
   "source": "ORVIS \"Plan budgets\"",
   "licence": "Public domain"
  },
  {
   "id": "P3",
   "group": "people",
   "dir": -1,
   "text": "You do your best work on your own.",
   "short": "On your own",
   "source": "IPIP \"Keep in the background\", turned round",
   "licence": "Public domain"
  },
  {
   "id": "D3",
   "group": "making",
   "dir": 1,
   "text": "You care how your notes and slides look.",
   "short": "Notes and slides",
   "source": "New wording. Visual making in everyday work",
   "licence": "Original"
  },
  {
   "id": "I3",
   "group": "ordering",
   "dir": 1,
   "text": "You like checking numbers to see what's really going on.",
   "short": "The numbers",
   "source": "O*NET \"Compute and record statistical and other numerical data\"",
   "licence": "O*NET open with credit"
  },
  {
   "id": "S3",
   "group": "plan",
   "dir": -1,
   "text": "You'd rather start and figure it out as you go.",
   "short": "Start first",
   "source": "IPIP \"Like to act on a whim\"",
   "licence": "Public domain"
  },
  {
   "id": "D4",
   "group": "making",
   "dir": 1,
   "text": "You'd enjoy building the set for a school show.",
   "short": "The show set",
   "source": "O*NET \"Design sets for plays\"",
   "licence": "O*NET open with credit"
  },
  {
   "id": "I4",
   "group": "ordering",
   "dir": 1,
   "text": "You'd enjoy running the schedule for an event.",
   "short": "The schedule",
   "source": "ORVIS \"Establish time schedules\". O*NET \"Manage the operations of a hotel\"",
   "licence": "Public domain. O*NET open with credit"
  },
  {
   "id": "P2",
   "group": "people",
   "dir": 1,
   "text": "You like solving problems out loud with others.",
   "short": "Out loud",
   "source": "IPIP \"Feel comfortable around people\"",
   "licence": "Public domain"
  },
  {
   "id": "D5",
   "group": "making",
   "dir": 1,
   "text": "A good poster or sign makes you stop and look.",
   "short": "A good sign",
   "source": "IPIP \"See beauty in things that others might not notice\"",
   "licence": "Public domain"
  },
  {
   "id": "I5",
   "group": "ordering",
   "dir": 1,
   "text": "You want to know how things work behind the scenes.",
   "short": "How it works",
   "source": "An idea only (interest in how a system works)",
   "licence": "Nothing copied. Original wording"
  },
  {
   "id": "S2",
   "group": "plan",
   "dir": 1,
   "text": "You like having a schedule to follow.",
   "short": "A schedule",
   "source": "IPIP \"Follow a schedule\"",
   "licence": "Public domain"
  }
 ],
 "roles": {
  "facilitator": {
   "name": "Facilitator",
   "a": "a",
   "word": "FACILITATOR",
   "read": "You get people moving together."
  },
  "quiet": {
   "name": "Soloist",
   "a": "a",
   "word": "SOLOIST",
   "read": "You do your best work on your own, with a clear run."
  },
  "planner": {
   "name": "Planner",
   "a": "a",
   "word": "PLANNER",
   "read": "You work out the steps before you start."
  },
  "improviser": {
   "name": "Improviser",
   "a": "an",
   "word": "IMPROVISER",
   "read": "You start, then fix it as you go."
  },
  "allrounder": {
   "name": "All Rounder",
   "a": "an",
   "word": "ALL ROUNDER",
   "read": "You do what the job needs."
  }
 },
 "leans": {
  "design": {
   "penguin": "shaper",
   "field": "Design",
   "clear": "leaning toward Design",
   "slight": "leaning a little toward Design",
   "read": "You agreed most with making things people look at.",
   "week": "Design at CMU: about 40 students a year, three tracks, and a lot of critique.",
   "other": "Look at the other side too: keeping the numbers and the schedule straight. That is Information Systems.",
   "nextTitle": "One place to start",
   "next": "Talk to the Design advisor this term. Changing in needs a portfolio and happens once a year.",
   "verify": true
  },
  "between": {
   "penguin": "bridge",
   "field": "Design and Information Systems",
   "clear": "between Design and Information Systems",
   "slight": "between Design and Information Systems",
   "read": "Your answers sit between the two. That can mean you like both.",
   "week": "You do not have to pick today. Human-Computer Interaction sits between the two.",
   "other": "Notice which homework you put off. It tells you more than this quiz.",
   "nextTitle": "One place to start",
   "next": "Take 15-112 this year and look at the HCI minor. That keeps both doors open.",
   "verify": true
  },
  "is": {
   "penguin": "builder",
   "field": "Information Systems",
   "clear": "leaning toward Information Systems",
   "slight": "leaning a little toward Information Systems",
   "read": "You agreed most with keeping numbers, lists and schedules straight.",
   "week": "IS at CMU: technology, business and people. You make an organization's information work.",
   "other": "Look at the other side too: how a thing looks and feels to one person. That is Design.",
   "nextTitle": "One place to start",
   "next": "Take 15-112 and aim for a B or better. Keep a 3.5 QPA. Apply by the last day of classes.",
   "verify": true
  }
 },
 "pick": {
  "ask": "If you had to pick today, which one?",
  "help": "This does not change your result.",
  "scored": false,
  "word": "TODAY?",
  "answers": [
   {
    "id": "design",
    "label": "Design"
   },
   {
    "id": "is",
    "label": "Information Systems"
   },
   {
    "id": "both",
    "label": "Both"
   },
   {
    "id": "unsure",
    "label": "Not sure yet"
   }
  ],
  "said": {
   "design": "You said Design.",
   "is": "You said Information Systems.",
   "both": "You said both.",
   "unsure": "You said not sure yet."
  },
  "then": {
   "match": "Your answers agree.",
   "design": "Your answers leaned Design.",
   "is": "Your answers leaned Information Systems.",
   "between": "Your answers sit between the two."
  }
 },
 "hero": {
  "line": "Which kind of",
  "word": "MAKER?",
  "cta": "Take the 2 minute quiz",
  "logo": "Maker Type",
  "promise": "A quiz to help you start looking at which kind of maker you are.",
  "for": "Design or Information Systems at CMU"
 },
 "bubbles": {
  "note": "Two to four words. Any penguin can say any line. Never tied to what a statement counts toward.",
  "waiting": [
   "No wrong answers",
   "Go with your gut",
   "Take your time",
   "First thought wins"
  ],
  "answered": [
   "Nice",
   "Noted",
   "Good one",
   "Hm, okay",
   "Interesting",
   "Got it"
  ],
  "back": [
   "Second thoughts?"
  ],
  "pick": [
   "Be honest"
  ]
 },
 "microcopy": {
  "back": "Go back",
  "restart.title": "Start over?",
  "restart.confirm": "Start over",
  "restart.cancel": "Keep my answers",
  "result.share": "Share your type",
  "result.again": "Take it again",
  "share.fail": "Sharing did not work. Save the image, or copy the address.",
  "share.copied": "Link copied",
  "nojs": "The quiz needs JavaScript. Turn it on and reload the page.",
  "footer": "A class project by William Liu for 67-265 at Carnegie Mellon. Nothing you answer leaves this page.",
  "start.resume": "Keep going",
  "start.over": "Start over",
  "result.other": "The other side",
  "result.card": "Your card",
  "progress": "{n} of 17",
  "keys": "Press 1 to 5",
  "restart.body": "This clears your answers.",
  "result.line": "You're {a} {role}, {lean}.",
  "result.count": "Agreed with {design} of 5 on making, {is} of 5 on ordering",
  "result.note": "",
  "result.honest": "A quick quiz, not a placement test. Ten statements give a rough lean. Three give a hint about how you work.",
  "result.answers": "How it added up",
  "result.why": "How you got {role}",
  "share.text": "I'm {a} {role}, {lean}, on Maker Type.",
  "pick.title": "What you said, what you tapped",
  "result.save": "Save the image",
  "why.role.won": "{name}. It takes 3 either way to earn one.",
  "why.role.short": "Not strong either way. It takes 3.",
  "why.role.lost": "Strong enough for {name}, but {winner} was stronger.",
  "why.same": "You gave every statement the same answer, so nothing stands out. Take it again and go with your gut.",
  "why.total": "{name} total",
  "why.verdict": "What it adds up to",
  "why.eq.lean": "Design {d} and IS {i} are {gap} apart. {band}",
  "why.band.between": "Up to 4 apart is between.",
  "why.band.slight": "5 to 8 apart is a little lean.",
  "why.band.clear": "9 or more apart is a lean.",
  "why.eq.role": "{pair} {n} reaches 3, so: {role}.",
  "why.eq.none": "Neither People nor Plan reaches 3, so: All Rounder.",
  "bar.between": "In between",
  "bar.you": "You",
  "bar.drag": "Drag me",
  "bar.label": "A bar from Design on the left to Information Systems on the right. You are {lean}.",
  "bar.try": "Drag between Design and Information Systems to try it.",
  "pick.said": "You said",
  "pick.answers": "Your answers",
  "lean.both": "Or both",
  "lean.design": "Looks and feels",
  "lean.is": "Makes information work",
  "lean.line": "See which of two top CMU majors you lean toward.",
  "why.all": "See all 16 answers",
  "result.pdf": "Print or save as PDF",
  "sheet.made": "Made on {date} at Maker Type. Nothing was stored."
 }
};
