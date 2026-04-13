import SwiftUI

struct WorkspaceRootView: View {
    @Environment(WorkspaceStore.self) private var store
    @AppStorage("inkline.defaultView") private var defaultViewRaw = WorkspaceSurface.editor.rawValue
    @SceneStorage("inkline.scene.project") private var sceneProjectID: String?
    @SceneStorage("inkline.scene.view") private var sceneViewRaw = WorkspaceSurface.editor.rawValue
    @SceneStorage("inkline.scene.episode") private var sceneEpisodeID: String?
    @State private var columnVisibility: NavigationSplitViewVisibility = .all
    @Namespace private var selectionNamespace

    var body: some View {
        NavigationSplitView(columnVisibility: $columnVisibility) {
            ProjectSidebarView(namespace: selectionNamespace)
        } content: {
            OutlineColumnView(namespace: selectionNamespace)
        } detail: {
            DetailContentView(namespace: selectionNamespace)
        }
        .searchable(text: Binding(
            get: { store.searchText },
            set: { store.searchText = $0 }
        ), prompt: "Search project content")
        .inspector(isPresented: Binding(
            get: { store.inspectorVisible },
            set: { store.inspectorVisible = $0 }
        )) {
            inspector
        }
        .toolbar {
            ToolbarItemGroup {
                Picker("Surface", selection: Binding(
                    get: { store.selectedView },
                    set: { store.selectedView = $0 }
                )) {
                    ForEach(WorkspaceSurface.allCases) { surface in
                        Label(surface.title, systemImage: surface.symbolName).tag(surface)
                    }
                }
                .pickerStyle(.segmented)

                Button("Add Episode") {
                    store.addEpisode()
                }
                .keyboardShortcut("e", modifiers: [.command, .shift])

                Button("Add Page") {
                    store.addPage()
                }
                .keyboardShortcut("p", modifiers: [.command, .shift])

                Button("Add Panel") {
                    store.addPanel()
                }
                .keyboardShortcut("n", modifiers: [.command, .shift])

                Toggle(isOn: Binding(
                    get: { store.focusMode },
                    set: { store.focusMode = $0 }
                )) {
                    Label("Focus Mode", systemImage: "sparkles")
                }
                .toggleStyle(.button)
            }
        }
        .onAppear {
            let restoredView = WorkspaceSurface(rawValue: sceneViewRaw) ?? WorkspaceSurface(rawValue: defaultViewRaw) ?? .editor
            store.restoreScene(projectID: sceneProjectID, view: restoredView, episodeID: sceneEpisodeID)
        }
        .onChange(of: store.selectedProjectID) { _, newValue in
            sceneProjectID = newValue
        }
        .onChange(of: store.selectedView) { _, newValue in
            sceneViewRaw = newValue.rawValue
            defaultViewRaw = newValue.rawValue
        }
        .onChange(of: store.selectedEpisodeID) { _, newValue in
            sceneEpisodeID = newValue
        }
    }

    private var inspector: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Inspector")
                .font(.title3.weight(.semibold))

            if let episode = store.selectedEpisode {
                Text("Episode \(episode.number)")
                    .font(.headline)
                Text(episode.brief)
                    .foregroundStyle(.secondary)
            }

            if let panel = store.selectedPanel {
                Divider()
                Text("Panel \(panel.number)")
                    .font(.headline)
                Text(panel.shot)
                    .foregroundStyle(.secondary)
                Text(panel.description)
                    .foregroundStyle(.secondary)
            }

            Divider()
            Text("Characters")
                .font(.headline)
            ForEach(store.currentProject?.characters ?? []) { character in
                VStack(alignment: .leading, spacing: 2) {
                    Text(character.name)
                    Text(character.role)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()
        }
        .padding(20)
        .frame(minWidth: 260)
    }
}
