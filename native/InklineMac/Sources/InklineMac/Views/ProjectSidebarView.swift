import SwiftUI

struct ProjectSidebarView: View {
    @Environment(WorkspaceStore.self) private var store
    let namespace: Namespace.ID

    var body: some View {
        @Bindable var store = store

        List(selection: $store.selectedProjectID) {
            Section("Projects") {
                ForEach(store.filteredProjects) { summary in
                    HStack(spacing: 10) {
                        Image(systemName: summary.format == .webtoon ? "rectangle.portrait" : "book.closed")
                            .foregroundStyle(.secondary)
                            .frame(width: 16)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(summary.title)
                                .lineLimit(1)
                            Text(summary.format.rawValue.capitalized)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .lineLimit(1)
                        }

                        Spacer(minLength: 8)

                        if summary.pinned {
                            Image(systemName: "pin.fill")
                                .font(.caption2)
                                .foregroundStyle(.yellow)
                        }
                    }
                    .tag(summary.id)
                    .contextMenu {
                        Button(summary.pinned ? "Unpin Project" : "Pin Project") {
                            store.togglePin(summary)
                        }
                    }
                }
            }
        }
        .listStyle(.sidebar)
        .navigationTitle("Inkline")
    }
}
