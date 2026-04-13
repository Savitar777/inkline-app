import SwiftUI

struct OutlineColumnView: View {
    @Environment(WorkspaceStore.self) private var store
    let namespace: Namespace.ID

    var body: some View {
        switch store.selectedView {
        case .editor:
            editorOutline
        case .collaboration:
            collaborationOutline
        case .compile:
            compileOutline
        }
    }

    private var editorOutline: some View {
        @Bindable var store = store

        return List(selection: $store.selectedEpisodeID) {
            ForEach(store.currentProject?.episodes ?? []) { episode in
                Section {
                    ForEach(episode.pages) { page in
                        DisclosureGroup("Page \(page.number)") {
                            ForEach(page.panels) { panel in
                                Button("Panel \(panel.number) · \(panel.shot)") {
                                    store.selectEpisode(episode.id)
                                    store.selectPage(page.id)
                                    store.selectedPanelID = panel.id
                                }
                                .buttonStyle(.plain)
                                .padding(.vertical, 2)
                            }
                        }
                        .padding(.vertical, 2)
                    }
                } header: {
                    HStack {
                        Text("Episode \(episode.number)")
                        Spacer()
                        if store.selectedEpisodeID == episode.id {
                            Capsule()
                                .fill(.tint.opacity(0.18))
                                .frame(width: 54, height: 22)
                                .overlay {
                                    Text("Live")
                                        .font(.caption2.weight(.semibold))
                                        .foregroundStyle(.tint)
                                }
                                .matchedGeometryEffect(id: "episode-status", in: namespace)
                        }
                    }
                    .contentShape(Rectangle())
                    .onTapGesture {
                        store.selectEpisode(episode.id)
                    }
                }
            }
        }
        .listStyle(.sidebar)
    }

    private var collaborationOutline: some View {
        @Bindable var store = store

        return List(selection: $store.selectedThreadID) {
            ForEach(store.currentProject?.threads ?? []) { thread in
                VStack(alignment: .leading, spacing: 4) {
                    Text(thread.label)
                        .lineLimit(1)
                    Text(thread.pageRange)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    if thread.unreadCount > 0 {
                        Text("\(thread.unreadCount) unread")
                            .font(.caption2.weight(.semibold))
                            .foregroundStyle(.blue)
                    }
                }
                .tag(thread.id)
            }
        }
        .listStyle(.sidebar)
    }

    private var compileOutline: some View {
        @Bindable var store = store

        return List(selection: $store.selectedFormat) {
            Section("Output Format") {
                ForEach(ComicFormat.allCases) { format in
                    Label(format.rawValue.capitalized, systemImage: format == .webtoon ? "rectangle.portrait" : "printer")
                        .tag(format)
                }
            }

            Section("Review Queue") {
                ForEach(store.selectedEpisode?.pages ?? []) { page in
                    ForEach(page.panels.filter { $0.status == .draftReceived || $0.status == .changesRequested }) { panel in
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Page \(page.number) · Panel \(panel.number)")
                            Text(panel.status.label)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
        }
        .listStyle(.sidebar)
    }
}
