// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "InklineMac",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(name: "InklineMac", targets: ["InklineMac"])
    ],
    targets: [
        .executableTarget(
            name: "InklineMac",
            path: "Sources/InklineMac"
        )
    ]
)
