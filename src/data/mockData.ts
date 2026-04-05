import type { Project } from '../types'

export const defaultProject: Project = {
  id: 'proj-1',
  title: 'The Obsidian Protocol',
  format: 'webtoon',
  episodes: [
    {
      id: 'ep1',
      number: 1,
      title: 'The Signal',
      brief: 'Mira discovers the anomaly in the company data.',
      pages: [],
    },
    {
      id: 'ep2',
      number: 2,
      title: 'Old Ghosts',
      brief: "Flashback to Mira's last day at Helix Corp.",
      pages: [],
    },
    {
      id: 'ep3',
      number: 3,
      title: 'The Offer',
      brief: "Tension. Corporate dread. Mira returns to the place she swore she'd never set foot in again. Cole is waiting — unhurried, expectant. The power dynamic is everything. Every shot should feel like a negotiation.",
      pages: [
        {
          id: 'p1',
          number: 1,
          layoutNote: 'Webtoon scroll unit — vertical pacing, wide establishing shot at top',
          panels: [
            {
              id: 'pan1',
              number: 1,
              shot: 'Wide / Establishing',
              description: "Exterior — Helix Corp tower, early morning. Glass and steel monolith against an overcast sky. A single figure (MIRA) stands at the base, small against the building. She hasn't moved in a while.",
              content: [
                { id: 'cb1', type: 'caption', character: 'Mira', text: "Three years. Three years and the building hasn't changed." },
                { id: 'cb2', type: 'caption', character: 'Mira', text: 'I have.' },
              ],
            },
            {
              id: 'pan2',
              number: 2,
              shot: 'Medium',
              description: "Mira walking through the lobby. Security guard nods at her — he recognizes her. Marble floors reflect fluorescent light. Her hand is in her coat pocket, thumb rubbing the scar on her index finger.",
              content: [
                { id: 'cb3', type: 'sfx', text: 'CLICK CLICK CLICK' },
                { id: 'cb4', type: 'dialogue', character: 'Security Guard', text: "Ms. Voss. It's been a while." },
                { id: 'cb5', type: 'dialogue', character: 'Mira', parenthetical: 'flat', text: 'Not long enough.' },
              ],
            },
            {
              id: 'pan3',
              number: 3,
              shot: 'Close-up',
              description: "Mira's hand pressing the elevator button for floor 42. Her index finger is visible — the thin scar across the knuckle catches the light. The button glows amber.",
              content: [
                { id: 'cb6', type: 'sfx', text: 'DING' },
              ],
            },
            {
              id: 'pan4',
              number: 4,
              shot: 'Medium-wide',
              description: "The boardroom. Floor-to-ceiling windows, city below. COLE sits at the far end of a long table, jacket off, sleeves rolled once. A single folder on the table between them. He doesn't stand when she enters.",
              content: [
                { id: 'cb7', type: 'dialogue', character: 'Cole', text: 'Mira.' },
                { id: 'cb8', type: 'dialogue', character: 'Cole', text: 'Sit. Please.' },
                { id: 'cb9', type: 'dialogue', character: 'Mira', parenthetical: 'still standing', text: "What's in the folder, Cole?" },
              ],
            },
          ],
        },
        {
          id: 'p2',
          number: 2,
          layoutNote: 'Tight pacing — the reveal. Hold tension before the folder opens.',
          panels: [
            {
              id: 'pan5',
              number: 1,
              shot: 'Close-up',
              description: "Cole's hand sliding the folder across the polished table. His cufflink catches light — it's engraved with the Helix logo. The folder is unmarked.",
              content: [
                { id: 'cb10', type: 'dialogue', character: 'Cole', text: 'Your second chance.' },
              ],
            },
            {
              id: 'pan6',
              number: 2,
              shot: 'Extreme close-up',
              description: "Mira's eyes. Reflected in them: the folder. Her expression is unreadable — but her jaw is tight.",
              content: [
                { id: 'cb11', type: 'caption', character: 'Mira', text: 'He always did know exactly what to say.' },
              ],
            },
            {
              id: 'pan7',
              number: 3,
              shot: 'Wide',
              description: 'Pull back to show the full boardroom — the distance between them, the city through the glass, the single folder as the only object on the vast table. Neither has moved.',
              content: [
                { id: 'cb12', type: 'dialogue', character: 'Mira', text: 'And if I say no?' },
                { id: 'cb13', type: 'dialogue', character: 'Cole', parenthetical: 'smiles', text: 'You already would have.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ep4',
      number: 4,
      title: 'The Fine Print',
      brief: 'Mira reads the contract. What she finds changes everything.',
      pages: [],
    },
    {
      id: 'ep5',
      number: 5,
      title: 'Fracture',
      brief: 'The team splinters. Loyalties are tested.',
      pages: [],
    },
  ],
  characters: [
    {
      id: 'char1',
      name: 'MIRA VOSS',
      role: 'Protagonist',
      desc: 'Early 30s. Sharp eyes, controlled body language. Thin scar across her right index finger — she rubs it when stressed. Former Helix Corp analyst who left under unclear circumstances. Wears dark, practical clothes.',
      color: '#22C55E',
    },
    {
      id: 'char2',
      name: 'COLE ARDEN',
      role: 'Antagonist',
      desc: "Mid 50s. Silver at the temples, expensive suit worn casually. Unhurried in everything — speech, movement, decisions. CEO of Helix Corp. Treats every conversation like a chess game he's already won.",
      color: '#F97316',
    },
  ],
  threads: [
    {
      id: 't1',
      episodeId: 'ep3',
      label: 'EP3 — The Offer',
      pageRange: 'Pages 1–2',
      status: 'draft_received',
      unread: 2,
      messages: [
        { id: 'm1', sender: 'writer', name: 'Henry', text: "Pages 1–2 are ready. The key beat: Mira entering the Helix building should feel massive — she's tiny against it. Panel 1 is the most important panel in the episode.", timestamp: '10:32 AM' },
        { id: 'm2', sender: 'artist', name: 'Kai', text: 'Got it. Going wide on panel 1 with heavy vertical exaggeration on the tower. Quick question — do you want the overcast sky to feel oppressive or just muted?', timestamp: '11:15 AM' },
        { id: 'm3', sender: 'writer', name: 'Henry', text: 'Oppressive. Like the sky is pressing down. Think brutalist atmosphere.', timestamp: '11:18 AM' },
        { id: 'm4', sender: 'artist', name: 'Kai', text: "Perfect. Here's the rough for Page 1 panels 1-2:", timestamp: '2:45 PM' },
        { id: 'm5', sender: 'artist', name: 'Kai', image: true, imageLabel: 'Page 1 — Panels 1-2 Draft', timestamp: '2:45 PM' },
        { id: 'm6', sender: 'artist', name: 'Kai', text: 'The lobby scene in panel 2 — I pushed the reflections harder to make it feel sterile. Let me know if this reads right.', timestamp: '2:47 PM' },
        { id: 'm7', sender: 'artist', name: 'Kai', image: true, imageLabel: 'Page 1 — Panels 3-4 Draft', timestamp: '3:12 PM' },
        { id: 'm8', sender: 'writer', name: 'Henry', text: "This is strong. Panel 1 nails it — exactly the scale I wanted. Panel 2 lobby reflections are great. One note: in panel 4 (boardroom), Cole needs to feel more relaxed. Right now he looks too stiff. He should own the room.", timestamp: '4:01 PM' },
      ],
    },
    {
      id: 't2',
      episodeId: 'ep2',
      label: 'EP2 — Old Ghosts',
      pageRange: 'Pages 1–3',
      status: 'approved',
      unread: 0,
      messages: [
        { id: 'm9', sender: 'writer', name: 'Henry', text: 'All pages approved. Great work on the flashback tone.', timestamp: 'Mar 28' },
      ],
    },
    {
      id: 't3',
      episodeId: 'ep1',
      label: 'EP1 — The Signal',
      pageRange: 'Pages 1–4',
      status: 'approved',
      unread: 0,
      messages: [
        { id: 'm10', sender: 'writer', name: 'Henry', text: 'Locked. Moving to EP2.', timestamp: 'Mar 22' },
      ],
    },
    {
      id: 't4',
      episodeId: 'ep3',
      label: 'EP3 — The Offer',
      pageRange: 'Pages 3–5',
      status: 'submitted',
      unread: 0,
      messages: [
        { id: 'm11', sender: 'writer', name: 'Henry', text: "Sending pages 3-5. Cole reveals what's in the folder. The tension should escalate with each page.", timestamp: '5:15 PM' },
      ],
    },
  ],
}
