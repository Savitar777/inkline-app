import Foundation

enum SampleData {
    static let projectSummaries: [ProjectSummary] = [
        ProjectSummary(id: "obsidian", title: "The Obsidian Protocol", format: .webtoon, updatedAt: .now, pinned: true),
        ProjectSummary(id: "ghosts", title: "Old Ghosts", format: .manga, updatedAt: .now.addingTimeInterval(-86_400), pinned: false),
        ProjectSummary(id: "fracture", title: "Fracture", format: .comic, updatedAt: .now.addingTimeInterval(-250_000), pinned: false),
    ]

    static let projects: [ProjectDocument] = [
        ProjectDocument(
            id: "obsidian",
            title: "The Obsidian Protocol",
            format: .webtoon,
            episodes: [
                Episode(
                    id: "ep3",
                    number: 3,
                    title: "The Offer",
                    brief: "Mira returns to Helix Corp. Every shot should feel like a negotiation.",
                    pages: [
                        Page(
                            id: "p1",
                            number: 1,
                            layoutNote: "Wide opener, oppressive sky, then a sterile lobby transition.",
                            panels: [
                                Panel(id: "pan1", number: 1, shot: "Wide / Establishing", description: "Helix tower dwarfs Mira at the base of the frame.", status: .draftReceived, content: [
                                    StoryBlock(id: "b1", kind: .caption, character: "Mira", text: "Three years and the building hasn't changed."),
                                    StoryBlock(id: "b2", kind: .caption, character: "Mira", text: "I have.")
                                ]),
                                Panel(id: "pan2", number: 2, shot: "Medium", description: "The lobby reflects fluorescent light back at her.", status: .changesRequested, content: [
                                    StoryBlock(id: "b3", kind: .dialogue, character: "Security Guard", text: "Ms. Voss. It's been a while.")
                                ])
                            ]
                        ),
                        Page(
                            id: "p2",
                            number: 2,
                            layoutNote: "Hold the tension before the folder opens.",
                            panels: [
                                Panel(id: "pan3", number: 1, shot: "Close-up", description: "Cole slides the folder across the table.", status: .submitted, content: [
                                    StoryBlock(id: "b4", kind: .dialogue, character: "Cole", text: "Your second chance.")
                                ]),
                                Panel(id: "pan4", number: 2, shot: "Wide", description: "Boardroom pullback, folder isolated between them.", status: .approved, content: [
                                    StoryBlock(id: "b5", kind: .dialogue, character: "Mira", text: "And if I say no?")
                                ])
                            ]
                        )
                    ]
                )
            ],
            characters: [
                CharacterReference(id: "mira", name: "MIRA VOSS", role: "Protagonist", detail: "Precise, controlled, and always reading the room.", accentHex: "#22C55E"),
                CharacterReference(id: "cole", name: "COLE ARDEN", role: "Antagonist", detail: "Unhurried CEO energy. Every sentence feels rehearsed.", accentHex: "#F97316")
            ],
            threads: [
                CollaborationThread(id: "thread-1", episodeID: "ep3", label: "EP3 — The Offer", pageRange: "Pages 1–2", status: .draftReceived, unreadCount: 2, messages: [
                    ThreadMessage(id: "msg-1", senderName: "Henry", role: "Writer", body: "Panel 1 should make Mira feel tiny against the tower.", timestampLabel: "10:32 AM"),
                    ThreadMessage(id: "msg-2", senderName: "Kai", role: "Artist", body: "I pushed the reflections in the lobby harder. Let me know if that reads sterile enough.", timestampLabel: "2:47 PM")
                ])
            ]
        )
    ]
}
