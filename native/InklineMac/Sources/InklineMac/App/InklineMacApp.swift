import SwiftUI

@main
struct InklineMacApp: App {
    @State private var store = WorkspaceStore()

    var body: some Scene {
        WindowGroup("Inkline", id: "main") {
            WorkspaceRootView()
                .environment(store)
        }
        .defaultSize(width: 1440, height: 920)
        .commands {
            InklineCommands(store: store)
        }

        Window("Review Preview", id: "review-preview") {
            ReviewPreviewWindowView()
                .environment(store)
                .frame(minWidth: 720, minHeight: 520)
        }

        Settings {
            InklineSettingsView()
        }
    }
}

private struct ReviewPreviewWindowView: View {
    @Namespace private var namespace

    var body: some View {
        DetailContentView(namespace: namespace)
    }
}

private struct InklineCommands: Commands {
    @Bindable var store: WorkspaceStore

    var body: some Commands {
        CommandMenu("Inkline") {
            Button("Script Editor") { store.selectedView = .editor }
                .keyboardShortcut("1", modifiers: [.command])
            Button("Collaboration") { store.selectedView = .collaboration }
                .keyboardShortcut("2", modifiers: [.command])
            Button("Compile & Export") { store.selectedView = .compile }
                .keyboardShortcut("3", modifiers: [.command])

            Divider()

            Button("Add Episode") { store.addEpisode() }
            Button("Add Page") { store.addPage() }
            Button("Add Panel") { store.addPanel() }
        }
    }
}
