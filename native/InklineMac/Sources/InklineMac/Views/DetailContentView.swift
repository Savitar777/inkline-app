import SwiftUI

struct DetailContentView: View {
    @Environment(WorkspaceStore.self) private var store
    let namespace: Namespace.ID

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                headerCard

                switch store.selectedView {
                case .editor:
                    editorDetail
                case .collaboration:
                    collaborationDetail
                case .compile:
                    compileDetail
                }
            }
            .padding(24)
        }
        .background(Color(nsColor: .windowBackgroundColor))
    }

    private var headerCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(store.currentProject?.title ?? "Inkline")
                .font(.largeTitle.weight(.semibold))
                .matchedGeometryEffect(id: "project-title", in: namespace)

            Text(store.selectedView.title)
                .font(.headline)
                .foregroundStyle(.secondary)

            Text("macOS-first editorial workspace with a stable split-view hierarchy, command access, and quick review states.")
                .foregroundStyle(.secondary)
        }
        .padding(24)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .shadow(color: Color.black.opacity(0.12), radius: 12, y: 8)
    }

    private var editorDetail: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Panel Detail")
                .font(.title2.weight(.semibold))

            if let panel = store.selectedPanel {
                ReviewStatusBadge(status: panel.status)

                VStack(alignment: .leading, spacing: 8) {
                    Text(panel.shot)
                        .font(.headline)
                    Text(panel.description)
                        .foregroundStyle(.secondary)
                    Divider()
                    ForEach(panel.content) { block in
                        VStack(alignment: .leading, spacing: 4) {
                            Text(block.kind.rawValue.uppercased())
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(.secondary)
                            Text(block.text)
                        }
                    }
                }
                .padding(20)
                .background(.background, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            }
        }
    }

    private var collaborationDetail: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Collaboration Thread")
                .font(.title2.weight(.semibold))

            if let thread = store.selectedThread {
                ReviewStatusBadge(status: thread.status)

                VStack(alignment: .leading, spacing: 12) {
                    ForEach(thread.messages) { message in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(message.senderName)
                                    .font(.headline)
                                Text(message.timestampLabel)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            Text(message.body)
                                .foregroundStyle(.secondary)
                        }
                        .padding(16)
                        .background(.background, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                    }
                }
            }
        }
    }

    private var compileDetail: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("Compile Preview")
                .font(.title2.weight(.semibold))

            HStack(spacing: 18) {
                Gauge(value: Double(store.activitySummary.exportReadyPercentage), in: 0...100) {
                    Text("Ready")
                } currentValueLabel: {
                    Text("\(store.activitySummary.exportReadyPercentage)%")
                }
                .gaugeStyle(.accessoryCircularCapacity)

                VStack(alignment: .leading, spacing: 6) {
                    Text("Pending review: \(store.activitySummary.pendingReview)")
                    Text("Changed since submit: \(store.activitySummary.changedSinceSubmission)")
                    Text("Unread collaboration: \(store.activitySummary.unreadCollaboration)")
                }
                .foregroundStyle(.secondary)
            }

            VStack(alignment: .leading, spacing: 12) {
                ForEach(ComicFormat.allCases) { format in
                    HStack {
                        Label(format.rawValue.capitalized, systemImage: "doc.richtext")
                        Spacer()
                        if store.selectedFormat == format {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(.tint)
                        }
                    }
                    .padding(16)
                    .background(.background, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                }
            }
        }
    }
}

private struct ReviewStatusBadge: View {
    let status: PanelStatus

    var body: some View {
        PhaseAnimator([false, true], trigger: status) { phase in
            Text(status.label)
                .font(.caption.weight(.semibold))
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(.tint.opacity(phase ? 0.18 : 0.1), in: Capsule())
                .foregroundStyle(.tint)
                .scaleEffect(phase ? 1 : 0.95)
        } animation: { _ in
            .spring(duration: 0.35, bounce: 0.25)
        }
    }
}
