import Foundation
import Observation

@MainActor
@Observable
final class WorkspaceStore {
    var projectSummaries = SampleData.projectSummaries
    var documents = SampleData.projects

    var selectedProjectID: String?
    var selectedView: WorkspaceSurface = .editor
    var selectedEpisodeID: String?
    var selectedPageID: String?
    var selectedPanelID: String?
    var selectedThreadID: String?
    var selectedFormat: ComicFormat = .webtoon
    var searchText = ""
    var inspectorVisible = true
    var focusMode = false
    var reviewMode = true

    init() {
        selectedProjectID = projectSummaries.first?.id
        selectedFormat = currentProject?.format ?? .webtoon
        selectedEpisodeID = currentProject?.episodes.first?.id
        selectedPageID = currentProject?.episodes.first?.pages.first?.id
        selectedPanelID = currentProject?.episodes.first?.pages.first?.panels.first?.id
        selectedThreadID = currentProject?.threads.first?.id
    }

    var filteredProjects: [ProjectSummary] {
        guard !searchText.isEmpty else { return projectSummaries }
        return projectSummaries.filter { summary in
            summary.title.localizedCaseInsensitiveContains(searchText)
                || summary.format.rawValue.localizedCaseInsensitiveContains(searchText)
        }
    }

    var currentProject: ProjectDocument? {
        documents.first(where: { $0.id == selectedProjectID }) ?? documents.first
    }

    var selectedEpisode: Episode? {
        currentProject?.episodes.first(where: { $0.id == selectedEpisodeID }) ?? currentProject?.episodes.first
    }

    var selectedPage: Page? {
        selectedEpisode?.pages.first(where: { $0.id == selectedPageID }) ?? selectedEpisode?.pages.first
    }

    var selectedPanel: Panel? {
        selectedPage?.panels.first(where: { $0.id == selectedPanelID }) ?? selectedPage?.panels.first
    }

    var selectedThread: CollaborationThread? {
        currentProject?.threads.first(where: { $0.id == selectedThreadID }) ?? currentProject?.threads.first
    }

    var activitySummary: ActivitySummary {
        let statuses = currentProject?.episodes
            .flatMap(\.pages)
            .flatMap(\.panels)
            .map(\.status) ?? []

        let pendingReview = statuses.filter { $0 == .draftReceived || $0 == .changesRequested }.count
        let changed = statuses.filter { $0 == .draft || $0 == .inProgress || $0 == .changesRequested }.count
        let approved = statuses.filter { $0 == .approved }.count
        let unread = currentProject?.threads.reduce(0, { $0 + $1.unreadCount }) ?? 0
        let percentage = statuses.isEmpty ? 0 : Int((Double(approved) / Double(statuses.count)) * 100)

        return ActivitySummary(
            pendingReview: pendingReview,
            changedSinceSubmission: changed,
            unreadCollaboration: unread,
            exportReadyPercentage: percentage
        )
    }

    func restoreScene(projectID: String?, view: WorkspaceSurface?, episodeID: String?) {
        if let projectID { selectProject(projectID) }
        if let view { selectedView = view }
        if let episodeID { selectedEpisodeID = episodeID }
    }

    func selectProject(_ id: String?) {
        selectedProjectID = id
        selectedFormat = currentProject?.format ?? .webtoon
        selectedEpisodeID = currentProject?.episodes.first?.id
        selectedPageID = currentProject?.episodes.first?.pages.first?.id
        selectedPanelID = currentProject?.episodes.first?.pages.first?.panels.first?.id
        selectedThreadID = currentProject?.threads.first?.id
    }

    func selectEpisode(_ id: String?) {
        selectedEpisodeID = id
        selectedPageID = selectedEpisode?.pages.first?.id
        selectedPanelID = selectedEpisode?.pages.first?.panels.first?.id
    }

    func selectPage(_ id: String?) {
        selectedPageID = id
        selectedPanelID = selectedPage?.panels.first?.id
    }

    func togglePin(_ summary: ProjectSummary) {
        guard let index = projectSummaries.firstIndex(where: { $0.id == summary.id }) else { return }
        projectSummaries[index].pinned.toggle()
        projectSummaries.sort {
            if $0.pinned == $1.pinned {
                return $0.updatedAt > $1.updatedAt
            }
            return $0.pinned && !$1.pinned
        }
    }

    func addEpisode() {
        guard let projectIndex = documents.firstIndex(where: { $0.id == currentProject?.id }) else { return }
        let nextNumber = documents[projectIndex].episodes.count + 1
        let episode = Episode(
            id: UUID().uuidString,
            number: nextNumber,
            title: "Episode \(nextNumber)",
            brief: "New episode brief",
            pages: []
        )
        documents[projectIndex].episodes.append(episode)
        selectedEpisodeID = episode.id
    }

    func addPage() {
        guard
            let projectIndex = documents.firstIndex(where: { $0.id == currentProject?.id }),
            let episodeIndex = documents[projectIndex].episodes.firstIndex(where: { $0.id == selectedEpisode?.id })
        else { return }

        let nextNumber = documents[projectIndex].episodes[episodeIndex].pages.count + 1
        let page = Page(id: UUID().uuidString, number: nextNumber, layoutNote: "Storyboard beats", panels: [])
        documents[projectIndex].episodes[episodeIndex].pages.append(page)
        selectedPageID = page.id
    }

    func addPanel() {
        guard
            let projectIndex = documents.firstIndex(where: { $0.id == currentProject?.id }),
            let episodeIndex = documents[projectIndex].episodes.firstIndex(where: { $0.id == selectedEpisode?.id }),
            let pageIndex = documents[projectIndex].episodes[episodeIndex].pages.firstIndex(where: { $0.id == selectedPage?.id })
        else { return }

        let nextNumber = documents[projectIndex].episodes[episodeIndex].pages[pageIndex].panels.count + 1
        let panel = Panel(
            id: UUID().uuidString,
            number: nextNumber,
            shot: "Wide",
            description: "New panel detail",
            status: .draft,
            content: []
        )
        documents[projectIndex].episodes[episodeIndex].pages[pageIndex].panels.append(panel)
        selectedPanelID = panel.id
    }
}
