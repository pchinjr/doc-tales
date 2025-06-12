# 🧠 UX Research Notes: Low-Friction Communication Triage via Curated Views  
*Informed by Morning Pages & Bullet Journaling, adapted for cognitive ease*

## Overview

This updated UX direction evolves our original inspirations—Morning Pages and Bullet Journaling—into **curation-first**, **no-writing-required** flows. The focus is on enabling the user to engage with their communication backlog *without lifting a pen (or opening a keyboard)*.

We aim to:
- Reduce cognitive load and decision fatigue.
- Offer a sense of accomplishment and agency quickly.
- Guide the user toward meaning and clarity without demanding effort.

---

## 🔄 UX Mode 1: Daily Cleanse (Zero-Input Morning Pages)

### Purpose
Offer users a simple, passive ritual to **clear clutter** by responding to what’s already present. No writing. No blank pages. Just *glance, tag, or skip*.

### User Journey

1. **Welcome Modal: “Let’s Clear the Static”**
   - Friendly, full-screen welcome prompt:
     _“Start your day by clearing what doesn’t matter and surfacing what does.”_
   - CTA: **"Begin Cleanse"**

2. **Curated Message Stacks**
   - System preselects a handful (3–7) of “untouched” or “overdue” items:
     - Long-unread emails
     - Threads with no reply
     - Docs or notes with no tags
   - Each item appears in a card with suggested actions:
     - ✅ Done / Ignore
     - 🔁 Needs Response
     - 🧠 Think About Later
     - 🔥 Urgent
     - ⛔ Delete / Mute

3. **Quick Actions + Auto-Fade**
   - Items fade out as actions are taken.
   - Option to “undo” recent actions in a side drawer.
   - Optional gesture support (swipe, arrow keys) to accelerate flow.

4. **Closure Screen**
   - “Nice work. You’ve cleared X items and surfaced Y priorities.”
   - Optional nudge to transition into Inbox, Archetype Dashboard, or Project Log.

---

## 📓 UX Mode 2: Smart Daily Log (Guided Bullet Journal)

### Purpose
Present a **pre-filled, symbol-driven journal** of today’s (or this week’s) comms. Users simply confirm, adjust, or defer without needing to write or plan.

### User Journey

1. **Auto-Populated Daily Log**
   - System generates a “Bullet Journal” list of:
     - Today’s messages
     - Tasks inferred from message content
     - Notes pulled from recognized patterns (e.g., meeting summaries, calendar events)

2. **Inline Symbol Suggestions**
   - Each log entry appears with suggested glyphs (e.g., 🔥, ☐, ✎, 🧠).
   - User can:
     - Confirm suggestion (tap to accept)
     - Swap symbol (scrollable mini-palette)
     - Skip or mark irrelevant

3. **Daily Digest Summary**
   - Auto-summary of current tags across the day.
   - Optional suggestions:
     - “Looks like you’ve got a lot of 🔁 recurring tasks. Want to schedule them?”
     - “🧠 Thinking pile is growing. Set aside 15 minutes tomorrow?”

4. **Migration & Indexing**
   - Any item can be:
     - Deferred to Future Log
     - Pinned to Project
     - Pushed to Archetype View
   - Index panel shows active tags + entry count per symbol

---

## 🧩 Shared UX System Components

### 🔣 Glyph Tag Engine (Low-Friction Metadata)
Build a semantic tagging layer that works across all views and modes.

- Suggested glyphs appear automatically via lightweight NLP or rule-based heuristics.
- Examples:
  - ☐ Task detected from verb phrases
  - 🔁 Based on repeated senders/threads
  - 🧠 Ambiguous tone or flagged by user in past
  - 🔥 If >2 follow-ups in thread or deadline language

### 💬 Tooltip Micro-Prompts (Instead of Writing)
Instead of journaling prompts, we show:
- Lightweight bubble questions:  
  _“Still worth your time?”_, _“Want to save this for next week?”_
- Can be answered with one click or ignored entirely.

---

## ✅ Dev Tasks for Q

1. [ ] Implement “Daily Cleanse” flow:
   - Curated message stack
   - Action tagging
   - Fade-out, undoable interactions

2. [ ] Implement “Smart Daily Log”:
   - Auto-populated log items
   - Suggested glyph tags
   - Per-item migration & summary logic

3. [ ] Build `glyphTag` engine:
   - Rules for initial suggestions
   - User overrides + confirmations
   - Shared symbol index and tag state

4. [ ] Optional: Tooltip question engine for 1-click journaling prompts

---

## Closing Thoughts

This new direction prioritizes user clarity *without* demanding input. It reimagines “reflection” as a reaction, not a responsibility—giving users agency through fast, symbolic choices instead of effortful documentation.

Let’s experiment with both flows in separate prototypes and A/B test with internal users.

– *UX Research & Design*
