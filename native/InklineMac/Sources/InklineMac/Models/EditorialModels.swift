import Foundation

enum WorkspaceSurface: String, CaseIterable, Identifiable, Codable {
    case editor
    case collaboration
    case compile

    var id: String { rawValue }

    var title: String {
        switch self {
        case .editor: "Script Editor"
        case .collaboration: "Collaboration"
        case .compile: "Compile & Export"
        }
    }

    var symbolName: String {
        switch self {
        case .editor: "pencil.and.scribble"
        case .collaboration: "bubble.left.and.bubble.right"
        case .compile: "square.stack.3d.down.forward"
        }
    }
}

enum ComicFormat: String, CaseIterable, Identifiable, Codable {
    case webtoon
    case manhwa
    case manga
    case comic

    var id: String { rawValue }
}

enum PanelStatus: String, CaseIterable, Codable {
    case draft
    case submitted
    case inProgress = "in_progress"
    case draftReceived = "draft_received"
    case changesRequested = "changes_requested"
    case approved

    var label: String {
        switch self {
        case .draft: "Draft"
        case .submitted: "Submitted"
        case .inProgress: "In Progress"
        case .draftReceived: "Draft Received"
        case .changesRequested: "Changes Requested"
        case .approved: "Approved"
        }
    }
}

enum BlockKind: String, Codable {
    case dialogue
    case caption
    case sfx
}

struct ProjectSummary: Identifiable, Hashable, Codable {
    let id: String
    var title: String
    var format: ComicFormat
    var updatedAt: Date
    var pinned: Bool
}

struct ProjectDocument: Identifiable, Codable {
    let id: String
    var title: String
    var format: ComicFormat
    var episodes: [Episode]
    var characters: [CharacterReference]
    var threads: [CollaborationThread]
}

struct Episode: Identifiable, Codable, Hashable {
    let id: String
    var number: Int
    var title: String
    var brief: String
    var pages: [Page]
}

struct Page: Identifiable, Codable, Hashable {
    let id: String
    var number: Int
    var layoutNote: String
    var panels: [Panel]
}

struct Panel: Identifiable, Codable, Hashable {
    let id: String
    var number: Int
    var shot: String
    var description: String
    var status: PanelStatus
    var content: [StoryBlock]
}

struct StoryBlock: Identifiable, Codable, Hashable {
    let id: String
    var kind: BlockKind
    var character: String?
    var text: String
}

struct CharacterReference: Identifiable, Codable, Hashable {
    let id: String
    var name: String
    var role: String
    var detail: String
    var accentHex: String
}

struct CollaborationThread: Identifiable, Codable, Hashable {
    let id: String
    var episodeID: String
    var label: String
    var pageRange: String
    var status: PanelStatus
    var unreadCount: Int
    var messages: [ThreadMessage]
}

struct ThreadMessage: Identifiable, Codable, Hashable {
    let id: String
    var senderName: String
    var role: String
    var body: String
    var timestampLabel: String
}

struct ActivitySummary: Hashable {
    var pendingReview: Int
    var changedSinceSubmission: Int
    var unreadCollaboration: Int
    var exportReadyPercentage: Int
}
