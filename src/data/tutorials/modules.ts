import type { TutorialModule } from './types'

export const TUTORIAL_MODULES: TutorialModule[] = [
  /* ─── App Features ─── */
  {
    id: 'af-script-editor',
    category: 'app-features',
    title: 'Script Editor Basics',
    summary: 'Learn how episodes, pages, panels, and content blocks fit together.',
    body: `The Script Editor is where your story takes shape. It's organized in a clear hierarchy:

**Episodes** are the top level — think of them as chapters or individual installments.

**Pages** sit inside episodes. Each page represents a single printed page or a section of vertical scroll.

**Panels** are the individual frames on a page. Each panel has a shot description and can hold multiple content blocks.

**Content Blocks** are the dialogue, captions, and sound effects that go inside panels. Each block has a type (dialogue, caption, or SFX), optional character attribution, and the actual text.

To add content, click the + buttons at each level. Use the inline editing to change any field — just click on the text you want to edit. Changes save automatically.

The panel type tags (establishing, action, dialogue, impact, transition) are optional but help you visualize your pacing at a glance.`,
    difficulty: 'beginner',
    roles: ['all'],
    readingMinutes: 3,
    relatedGlossaryIds: ['panel', 'content-block', 'caption', 'sfx'],
    relatedModuleIds: ['af-collaboration'],
  },
  {
    id: 'af-collaboration',
    category: 'app-features',
    title: 'Collaboration & Handoff',
    summary: 'Submit pages to your artist, exchange feedback, and manage the review cycle.',
    body: `Collaboration in Inkline follows a structured handoff workflow:

**1. Submit to Artist** — When your script is ready, use "Submit to Artist" to create a collaboration thread. Select which pages to include.

**2. Thread Messaging** — The Collaboration view shows active threads where you and your artist can exchange messages. Each thread is tied to specific pages.

**3. Artwork Upload** — The artist uploads panel artwork through the thread. Each upload creates a revision entry, so you can see the history.

**4. Review & Approve** — In Compile & Export, review each panel. You can approve it or request changes with a specific note. Change requests appear as structured entries that track open vs. resolved status.

**5. Bulk Approval** — When all panels on a page look good, use bulk approve to approve them all at once.

The panel status flow is: Draft → Submitted → In Progress → Draft Received → Changes Requested (if needed) → Approved.`,
    difficulty: 'beginner',
    roles: ['writer', 'artist'],
    readingMinutes: 3,
    relatedGlossaryIds: ['change-request', 'thread'],
    relatedModuleIds: ['af-script-editor', 'af-export'],
  },
  {
    id: 'af-export',
    category: 'app-features',
    title: 'Export & Preflight',
    summary: 'Export your finished work as PDF, PNG, WebP, or ZIP with preflight validation.',
    body: `The Compile & Export view handles final output. Before exporting, the preflight system checks your work:

**Preflight Checks:**
- All panels in scope must be approved
- No open change requests
- DPI matches your target (72 for web, 300 for print)
- Color profile compatibility (CMYK doesn't work with WebP)

**Export Formats:**
- **PDF** — Best for print. Page-based for manga/comic, scroll-based for webtoon/manhwa.
- **PNG** — Single image or sequence. Lossless quality.
- **WebP** — Smaller file size than PNG with adjustable quality.
- **ZIP** — PNG sequence bundled with a manifest file.

**Webtoon Slicing** — For webtoon/manhwa formats, enable "Slice for upload" to cut the long strip into ≤800px chunks compatible with LINE Webtoon's upload requirements.

**Thumbnails** — Generate cover art thumbnails at standard sizes (300×300, 600×600, 1200×630) for platform listings.

**Presets** — Use built-in presets (Webtoon Web, Manga Print, Comic Print, Manhwa Web) to auto-configure DPI, color profile, and output format.`,
    difficulty: 'beginner',
    roles: ['all'],
    readingMinutes: 3,
    relatedGlossaryIds: ['dpi', 'cmyk', 'rgb', 'bleed'],
    relatedModuleIds: ['af-collaboration', 'prod-export-checklist'],
  },
  {
    id: 'af-story-bible',
    category: 'app-features',
    title: 'Story Bible',
    summary: 'Track story arcs, locations, world rules, and timeline events.',
    body: `The Story Bible keeps your world-building organized across four tabs:

**Arcs** — Track story arcs with start/end episodes and linked characters. Mark arcs as planning, active, or completed.

**Locations** — Document places in your story with descriptions and reference images. These serve as quick references when writing scene descriptions.

**World Rules** — Establish the rules of your story's world. Whether it's magic systems, technology limits, or social structures, documenting them prevents inconsistencies.

**Timeline** — Order key events chronologically and tie them to specific episodes. This is especially useful for non-linear narratives or stories with flashbacks.

All Story Bible content is searchable through the command palette (Cmd+K).`,
    difficulty: 'beginner',
    roles: ['writer'],
    readingMinutes: 2,
    relatedGlossaryIds: ['story-arc'],
    relatedModuleIds: ['af-character-bible'],
  },
  {
    id: 'af-character-bible',
    category: 'app-features',
    title: 'Character Bible',
    summary: 'Build detailed character profiles with relationships and arcs.',
    body: `The Character Bible extends beyond basic name and role. Each character profile includes:

**Core Info** — Name, role, description, and a color tag for quick identification.

**Extended Profile** — Appearance, personality, goals, fears, backstory, and speech patterns. These fields help maintain character consistency across episodes.

**Relationships** — Map connections between characters: ally, rival, mentor, mentee, love interest, family, friend, enemy. Each relationship has a description explaining its nature.

**Character Arcs** — Link characters to story arcs and define their start and end states. This tracks how characters transform through the narrative.

When editing scripts, hovering over a character name in panel content shows an inline profile preview — a quick reference without leaving the editor.`,
    difficulty: 'beginner',
    roles: ['writer'],
    readingMinutes: 2,
    relatedGlossaryIds: ['character-arc'],
    relatedModuleIds: ['af-story-bible'],
  },

  /* ─── Panel Composition ─── */
  {
    id: 'pc-panel-types',
    category: 'panel-composition',
    title: 'Panel Types & When to Use Them',
    summary: 'Establishing, action, dialogue, impact, and transition panels each serve a narrative purpose.',
    body: `Every panel in a comic serves a specific storytelling function. Understanding these types helps you make deliberate choices:

**Establishing** — Sets the scene. Wide shots showing location, time of day, or atmosphere. Use at the start of a new scene or when the setting changes.

**Action** — Captures movement, conflict, or physical activity. The composition should convey energy and direction. Camera angle and motion lines are key.

**Dialogue** — Character conversation. The focus is on expressions and body language. Keep backgrounds simple so text remains readable.

**Impact** — The dramatic moment. A reveal, a punch, an emotional peak. Often larger than surrounding panels. Use sparingly for maximum effect.

**Transition** — Bridges between scenes or moments. Can be a time skip, a location change, or an emotional shift. Often minimal in detail.

A common beginner mistake is using too many impact panels. When everything is dramatic, nothing feels dramatic. Reserve impact panels for genuine turning points.`,
    difficulty: 'beginner',
    roles: ['writer', 'artist'],
    readingMinutes: 3,
    relatedGlossaryIds: ['establishing-shot', 'impact-panel', 'transition-panel'],
    relatedModuleIds: ['pc-density', 'pacing-impact'],
  },
  {
    id: 'pc-density',
    category: 'panel-composition',
    title: 'Panel Density & Layout',
    summary: 'How many panels per page affects reading speed and emotional weight.',
    body: `Panel density — the number of panels on a page — directly controls pacing:

**Low density (1–3 panels):** Slow, contemplative moments. Each panel gets more visual weight. Good for emotional beats, reveals, and establishing shots.

**Medium density (4–6 panels):** Standard storytelling pace. Balances detail with momentum. Most conversation and action sequences live here.

**High density (7+ panels):** Rapid pacing. Creates urgency, montage effects, or information density. Panels are smaller, so detail is limited.

**Format matters:**
- Webtoon: density is per scroll section, not per page. You have more vertical space but narrower width.
- Manga: B5 pages are smaller than Western comics, so 6+ panels can feel cramped.
- Comic: larger page size accommodates higher panel counts comfortably.

**Rule of thumb:** Vary your density. A page of 8 small panels followed by a full-page splash creates contrast that guides the reader's emotional experience.`,
    difficulty: 'intermediate',
    roles: ['writer', 'artist'],
    readingMinutes: 3,
    relatedGlossaryIds: ['splash-page', 'gutter', 'panel-density'],
    relatedModuleIds: ['pc-panel-types', 'pc-gutters'],
  },
  {
    id: 'pc-gutters',
    category: 'panel-composition',
    title: 'Gutters & Reading Flow',
    summary: "The space between panels guides the reader's eye and controls timing.",
    body: `The gutter — the space between panels — is an invisible storytelling tool:

**Wider gutters** = more time passing between panels. A wide gutter between two expressions implies a pause, a moment of thought.

**Narrow gutters** = rapid succession. Panels feel connected, almost simultaneous. Action sequences benefit from tight gutters.

**No gutter (bleeding panels together)** = continuous action or overlapping moments. Common in manga for intense sequences.

**Reading direction:**
- Western comics: left-to-right, top-to-bottom (Z pattern)
- Manga: right-to-left, top-to-bottom
- Webtoon: top-to-bottom only (single column)

Your panel arrangement should guide the eye naturally. Avoid layouts where the reading order is ambiguous — if a reader has to stop and figure out which panel comes next, you've lost them.`,
    difficulty: 'intermediate',
    roles: ['writer', 'artist'],
    readingMinutes: 2,
    relatedGlossaryIds: ['gutter', 'bleed', 'reading-flow'],
    relatedModuleIds: ['pc-density'],
  },
  {
    id: 'pc-reading-flow',
    category: 'panel-composition',
    title: 'Designing Clear Reading Flow',
    summary: 'Layout techniques that make panel order intuitive for readers.',
    body: `A well-designed page should never leave the reader wondering "where do I look next?" Here are core principles:

**Consistent row heights** — When panels in the same row share the same height, readers naturally track left-to-right (or right-to-left for manga) before moving down.

**T and L intersections** — Where panel borders meet, create clear T-shapes rather than + intersections. A + intersection creates four possible reading paths; a T-intersection creates only two.

**Diagonal flow** — For dynamic layouts, arrange panels so the reader's eye follows a diagonal path. Place key visual elements along this diagonal.

**Overlapping panels** — When panels overlap, the one on top reads first. Use this to create depth and guide priority.

**For webtoon/vertical scrolling:** Reading flow is simpler — strictly top to bottom. Your challenge is maintaining engagement through vertical rhythm rather than page-level composition.`,
    difficulty: 'advanced',
    roles: ['artist'],
    readingMinutes: 3,
    relatedGlossaryIds: ['reading-flow', 'gutter'],
    relatedModuleIds: ['pc-gutters', 'pc-density'],
  },

  /* ─── Pacing & Storytelling ─── */
  {
    id: 'pacing-decompression',
    category: 'pacing',
    title: 'Decompression',
    summary: 'Stretching a moment across multiple panels to control emotional weight.',
    body: `Decompression is the art of slowing down time in your comic by spreading a single moment across multiple panels:

**What it does:** A character reaching for a door handle might take one panel in compressed storytelling, but four panels when decompressed — approaching, reaching, gripping, turning. Each panel adds weight to the moment.

**When to use it:**
- Before a reveal (building anticipation)
- During emotional moments (letting feelings land)
- In quiet character beats (showing internal thought)
- To contrast with preceding action (a breath after intensity)

**When to avoid it:** If every moment is decompressed, your story crawls. The power of decompression comes from contrast with faster-paced sections.

**Format note:** Webtoon is naturally decompressive — the scroll format encourages stretching moments vertically. Manga and comics have page-count constraints that make decompression a more deliberate choice.`,
    difficulty: 'intermediate',
    roles: ['writer'],
    readingMinutes: 2,
    relatedGlossaryIds: ['decompression', 'beat-panel'],
    relatedModuleIds: ['pacing-impact', 'pacing-silence'],
  },
  {
    id: 'pacing-impact',
    category: 'pacing',
    title: 'Impact Panels & Reveals',
    summary: 'Using size, placement, and contrast to make key moments land.',
    body: `Impact panels are your story's exclamation points. Here's how to make them work:

**Size** — An impact panel should be significantly larger than surrounding panels. A half-page or full-page panel commands attention precisely because the preceding panels were smaller.

**Placement** — In page-based formats, the bottom-right of a right-hand page (or bottom of a scroll section in webtoon) forces the reader to turn/scroll to see the result. This is the "page-turn reveal" technique.

**Buildup** — Impact panels need setup. A sequence of smaller, quieter panels building tension makes the large panel feel earned.

**Contrast** — An impact panel works best when it breaks the established visual pattern. If your page has been orderly grids, an irregular, borderless impact panel feels explosive.

**Frequency** — Limit impact panels to 1–2 per episode. Overuse destroys their effectiveness. If you have 3 "impact" moments in an episode, choose the most important one.`,
    difficulty: 'intermediate',
    roles: ['writer', 'artist'],
    readingMinutes: 2,
    relatedGlossaryIds: ['impact-panel', 'splash-page', 'page-turn-reveal'],
    relatedModuleIds: ['pacing-decompression', 'pacing-page-turns'],
  },
  {
    id: 'pacing-page-turns',
    category: 'pacing',
    title: 'Page-Turn Reveals',
    summary: 'Using page boundaries to create suspense and surprise.',
    body: `In page-based formats (manga, comic), the page turn is a built-in suspense mechanism:

**The principle:** The reader can only see two pages at a time (the spread). When they turn the page, there's a micro-moment of anticipation. Place your reveals on the first panel of a new page (or a new scroll section in webtoon).

**Setup page:** End the right-hand page with a reaction shot, a question, or an incomplete action. "What's behind the door?" — turn the page — the answer.

**Common patterns:**
- Character sees something off-panel → turn → what they see
- Dialogue builds to a question → turn → the answer
- Action sequence in motion → turn → the result

**Webtoon equivalent:** Since there's no physical page turn, use vertical whitespace (a gap in the scroll) or a dramatic horizontal panel break to create the same effect.

**Manga note:** Remember that manga reads right-to-left, so the "reveal page" is the left page of the spread.`,
    difficulty: 'intermediate',
    roles: ['writer'],
    readingMinutes: 2,
    relatedGlossaryIds: ['page-turn-reveal', 'spread'],
    relatedModuleIds: ['pacing-impact', 'pacing-silence'],
  },
  {
    id: 'pacing-silence',
    category: 'pacing',
    title: 'Silent Panels & Visual Storytelling',
    summary: 'Panels without dialogue that convey meaning through art alone.',
    body: `Some of the most powerful moments in comics have no words at all:

**What silent panels do:**
- Create emotional space for the reader to feel, not just read
- Show instead of tell
- Control pacing (a silent panel is a beat, a pause)
- Build atmosphere and mood

**Types of silent panels:**
- **Reaction shots** — A character's face after receiving news. The expression does the work.
- **Environmental** — A landscape, an empty room, a clock ticking. Setting the mood.
- **Action beats** — Physical movement without narration. A hand closing into a fist.
- **Transition silence** — A quiet panel between two scenes, creating breathing room.

**Common mistake:** Adding a caption or thought bubble to a panel that works better silent. Trust your artist's ability to convey emotion through visuals. If you find yourself writing "Caption: She felt sad" over a panel showing a character looking sad — delete the caption.`,
    difficulty: 'intermediate',
    roles: ['writer', 'artist'],
    readingMinutes: 2,
    relatedGlossaryIds: ['beat-panel', 'decompression'],
    relatedModuleIds: ['pacing-decompression', 'pacing-impact'],
  },

  /* ─── Dialogue & Readability ─── */
  {
    id: 'dl-density',
    category: 'dialogue',
    title: 'Dialogue Density',
    summary: 'How much text per panel and per page keeps things readable.',
    body: `Comics are a visual medium — too much text overwhelms the art and kills the pacing:

**Panel-level guidelines:**
- Dialogue: 2–3 short sentences max per bubble
- Captions: 1–2 sentences
- Multiple speakers: max 3 bubbles per panel before it gets cluttered

**Page-level guidelines:**
- Total word count: aim for 25–35 words per panel as a ceiling
- Balance: if one panel is text-heavy, make adjacent panels lighter
- A page full of text-heavy panels reads like a novel with pictures, not a comic

**Webtoon exception:** Vertical scroll gives you more panels, so you can spread dialogue thinner. One bubble per panel is common and effective.

**Edit ruthlessly:** Write your dialogue, then cut it by 30%. Comics reward brevity. "I can't believe you would do something like this to me after everything we've been through" becomes "After everything — this?"`,
    difficulty: 'beginner',
    roles: ['writer'],
    readingMinutes: 2,
    relatedGlossaryIds: ['dialogue-density', 'word-balloon'],
    relatedModuleIds: ['dl-placement', 'dl-sfx'],
  },
  {
    id: 'dl-placement',
    category: 'dialogue',
    title: 'Bubble Placement',
    summary: 'Where to position speech bubbles to maintain reading flow.',
    body: `Bubble placement directly affects how smoothly a page reads:

**Reading order rule:** Bubbles are read top-to-bottom, left-to-right (right-to-left in manga). The first speaker's bubble must be positioned higher and in the reading-direction-first position.

**Don't cover key art:** Bubbles shouldn't hide faces, important objects, or action. Plan bubble placement during the layout phase, not after the art is done.

**Tail direction:** The bubble tail should clearly point to the speaker. Ambiguous tails confuse the reader about who's talking.

**Lettering space:** Leave room in the panel composition for bubbles. A common artist-writer coordination issue: the artist draws a beautiful full-bleed panel, then the letterer has nowhere to put the dialogue. In Inkline, use the lettering overlay to plan placement before final export.

**Connected bubbles:** When one character speaks multiple sentences, connected bubbles (or a single larger bubble) read faster than separate bubbles stacked vertically.`,
    difficulty: 'intermediate',
    roles: ['writer', 'letterer'],
    readingMinutes: 2,
    relatedGlossaryIds: ['word-balloon', 'lettering', 'tail'],
    relatedModuleIds: ['dl-density', 'dl-sfx'],
  },
  {
    id: 'dl-sfx',
    category: 'dialogue',
    title: 'Sound Effects (SFX)',
    summary: 'When and how to use onomatopoeia in your panels.',
    body: `Sound effects are unique to comics — they make the page feel alive:

**When to use SFX:**
- Physical impacts (WHAM, CRACK, THUD)
- Environmental sounds (DRIP, CREAK, BOOM)
- Character sounds (GASP, SIGH)
- Mechanical sounds (VROOM, CLICK, BEEP)

**When NOT to use SFX:**
- Quiet scenes where sound would break the mood
- Every single action — too many SFX clutters the page
- When the art already conveys the sound clearly

**Style considerations:**
- SFX integrated into the art (drawn by the artist) have more impact than lettered SFX
- Size reflects volume — a small "drip" vs. a massive "BOOM"
- Font/style reflects quality — jagged letters for sharp sounds, rounded for soft sounds

**Manga convention:** Japanese SFX (onomatopoeia) are extensive — there are sounds for silence, for tension, for staring. Western comics use SFX more sparingly. Choose the convention that fits your format.`,
    difficulty: 'beginner',
    roles: ['writer', 'letterer'],
    readingMinutes: 2,
    relatedGlossaryIds: ['sfx', 'onomatopoeia', 'lettering'],
    relatedModuleIds: ['dl-density', 'dl-placement'],
  },

  /* ─── Format-Specific ─── */
  {
    id: 'fs-webtoon-vs-manga',
    category: 'format-specific',
    title: 'Webtoon vs. Manga',
    summary: 'Key differences in layout, pacing, and conventions between vertical scroll and page-based formats.',
    body: `Webtoon and manga look similar but demand different storytelling approaches:

**Layout:**
- Webtoon: single column, 800px wide, infinite vertical scroll. One panel per "row" is standard.
- Manga: B5 pages (182×257mm), multi-panel layouts, read right-to-left.

**Pacing:**
- Webtoon: naturally slower/decompressive. Readers scroll at their own pace. Vertical reveals (scroll down to see what happens) replace page-turn reveals.
- Manga: faster, denser. Page-turns create natural suspense points. Economy of panels is important due to page count limits.

**Art style:**
- Webtoon: full color is expected. Simpler backgrounds are common due to the production pace.
- Manga: grayscale (screentone). More detailed linework and backgrounds. Black and white contrast is a core artistic tool.

**Reading experience:**
- Webtoon: mobile-first. Art must read well on small screens.
- Manga: print or large-screen oriented. Fine detail is appreciated.

**In Inkline:** The format picker automatically adjusts panel dimensions, assembly layout, and export settings. But the storytelling choices — pacing, density, art style — are yours.`,
    difficulty: 'beginner',
    roles: ['all'],
    readingMinutes: 3,
    relatedGlossaryIds: ['webtoon', 'manga', 'screentone'],
    relatedModuleIds: ['fs-vertical-pacing', 'fs-print-margins'],
  },
  {
    id: 'fs-vertical-pacing',
    category: 'format-specific',
    title: 'Vertical Scroll Pacing',
    summary: 'Pacing techniques specific to webtoon and manhwa vertical formats.',
    body: `Vertical scroll changes how readers experience your story:

**The scroll as a timeline:** In vertical formats, scrolling down = moving forward in time. This creates a direct physical connection between reader action and story progression.

**Whitespace as pause:** Adding vertical space between panels creates a beat — the reader scrolls through "nothing" for a moment, which builds anticipation or gives a breather.

**Gradual reveals:** Instead of a page-turn reveal, use the scroll boundary. Place a dramatic panel just below the current viewport so the reader gradually scrolls it into view.

**Rhythm through height:** Vary panel heights to create rhythm. Tall panels slow the reader down (more to take in). Short/narrow panels speed things up. A sequence of short panels followed by a tall one creates a drumroll → impact pattern.

**Avoid horizontal complexity:** Readers scroll vertically. Side-by-side panels on mobile are tiny and hard to read. Stick to single-column or very simple two-column layouts at most.`,
    difficulty: 'intermediate',
    roles: ['writer', 'artist'],
    formats: ['webtoon', 'manhwa'],
    readingMinutes: 2,
    relatedGlossaryIds: ['webtoon', 'decompression'],
    relatedModuleIds: ['fs-webtoon-vs-manga', 'pacing-decompression'],
  },
  {
    id: 'fs-print-margins',
    category: 'format-specific',
    title: 'Print Safety: Bleed & Safe Zones',
    summary: 'Understanding bleed, trim, and safe zones for print-bound comics.',
    body: `If your comic will be printed, you need to understand three zones:

**Bleed area** — Extends 3–5mm beyond the trim line on all sides. Art in this area may be cut off during printing. Extend backgrounds into the bleed so there's no white edge if the cut is slightly off.

**Trim line** — Where the page will actually be cut. This is your "real" page boundary.

**Safe zone** — 5–10mm inside the trim line. ALL text and critical visual elements must be inside this zone. Anything between the safe zone and trim line risks being cut or falling into the binding gutter.

**Binding gutter** — The inner edge where pages meet the spine. In a perfect-bound book, 5–10mm of the inner edge disappears into the binding. Don't place important elements here.

**In Inkline:** When exporting for print (manga-print or comic-print presets), the assembly engine accounts for trim dimensions. But you still need to compose your panels with safe zones in mind — Inkline can't move your dialogue away from the edge for you.`,
    difficulty: 'advanced',
    roles: ['artist'],
    formats: ['manga', 'comic'],
    readingMinutes: 2,
    relatedGlossaryIds: ['bleed', 'safe-zone', 'trim-line', 'gutter'],
    relatedModuleIds: ['af-export'],
  },

  /* ─── Production Workflow ─── */
  {
    id: 'prod-thumbnail-workflow',
    category: 'production',
    title: 'Thumbnail Sketches',
    summary: 'Planning pages with rough thumbnail sketches before committing to final art.',
    body: `Professional comics start with thumbnails — tiny, rough sketches of each page:

**What thumbnails are:** Quick, small (business-card-sized) sketches showing panel layout, character positions, and general composition. No detail, no polish — just the bones.

**Why they matter:**
- Catch pacing problems before investing in final art
- Experiment with layouts quickly
- Communicate vision between writer and artist
- Identify pages that need more/fewer panels

**The thumbnail process:**
1. Read the script for the episode
2. Sketch each page as a small rectangle, placing panels roughly
3. Mark where key moments land (impact panels, reveals, page-turns)
4. Review the full episode's thumbnails as a sequence — does the pacing flow?
5. Revise before moving to pencils

**In Inkline:** While there's no built-in thumbnail sketch tool, you can use the panel type tags and layout notes to plan your composition before artwork begins. The Production Tracker helps you monitor which pages are at which stage.`,
    difficulty: 'beginner',
    roles: ['artist'],
    readingMinutes: 2,
    relatedGlossaryIds: ['thumbnail-sketch'],
    relatedModuleIds: ['prod-review-cycle', 'pc-density'],
  },
  {
    id: 'prod-review-cycle',
    category: 'production',
    title: 'The Review Cycle',
    summary: 'How to give effective feedback and manage revisions efficiently.',
    body: `A smooth review cycle keeps your project moving:

**For writers giving feedback:**
- Be specific: "The character's expression in panel 3 should be more surprised" not "fix panel 3"
- Reference the panel number and page
- Distinguish between must-fix (blocking) and nice-to-have suggestions
- Use change requests in Inkline — they create a trackable record

**For artists receiving feedback:**
- Ask clarifying questions before revising
- Upload revisions as new versions — don't overwrite the original
- Resolve change requests as you address them so the writer can track progress

**Managing revision rounds:**
- Set expectations upfront: how many revision rounds are included?
- Each round should have fewer notes than the last — if notes increase, the communication may need work
- Use the Production Tracker to monitor which panels are stuck in review

**In Inkline:** The Change Request system tracks open vs. resolved notes per panel. The revision history shows all uploaded versions with timestamps. Bulk approval per page speeds up final sign-off.`,
    difficulty: 'beginner',
    roles: ['writer', 'artist'],
    readingMinutes: 3,
    relatedGlossaryIds: ['change-request', 'revision'],
    relatedModuleIds: ['af-collaboration', 'prod-export-checklist'],
  },
  {
    id: 'prod-export-checklist',
    category: 'production',
    title: 'Pre-Export Checklist',
    summary: 'Everything to verify before hitting the export button.',
    body: `Before exporting your final files, verify:

**Content completeness:**
- [ ] All panels have approved artwork
- [ ] All change requests are resolved
- [ ] Dialogue and captions are proofread
- [ ] SFX are placed correctly
- [ ] Character names and terms are consistent

**Technical settings:**
- [ ] Correct format selected (webtoon/manga/comic/manhwa)
- [ ] DPI appropriate for target (72 web, 300 print)
- [ ] Color profile correct (RGB for web/screen, CMYK for professional print)

**For print:**
- [ ] Text is within safe zone (away from trim edges)
- [ ] Art extends to bleed
- [ ] No important elements near binding gutter

**For webtoon upload:**
- [ ] "Slice for upload" enabled (≤800px chunks)
- [ ] Image dimensions within platform limits
- [ ] File sizes within upload limits

**In Inkline:** The preflight system catches the most critical issues automatically. The Export Checklist in the sidebar gives you an at-a-glance status. But the creative checks (proofreading, consistency) are still on you.`,
    difficulty: 'beginner',
    roles: ['all'],
    readingMinutes: 2,
    relatedGlossaryIds: ['dpi', 'cmyk', 'rgb', 'bleed', 'safe-zone'],
    relatedModuleIds: ['af-export', 'prod-review-cycle'],
  },
]
