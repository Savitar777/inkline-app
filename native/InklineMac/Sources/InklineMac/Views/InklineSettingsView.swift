import SwiftUI

struct InklineSettingsView: View {
    @AppStorage("inkline.defaultView") private var defaultViewRaw = WorkspaceSurface.editor.rawValue

    var body: some View {
        Form {
            Picker("Default View", selection: $defaultViewRaw) {
                ForEach(WorkspaceSurface.allCases) { surface in
                    Text(surface.title).tag(surface.rawValue)
                }
            }

            Toggle("Start in review mode", isOn: .constant(true))
            Toggle("Keep inspector open", isOn: .constant(true))
        }
        .formStyle(.grouped)
        .padding(20)
        .frame(width: 420)
    }
}
