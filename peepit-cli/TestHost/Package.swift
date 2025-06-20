// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "PeepItTestHost",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .executable(
            name: "PeepItTestHost",
            targets: ["PeepItTestHost"]
        )
    ],
    targets: [
        .executableTarget(
            name: "PeepItTestHost",
            path: ".",
            sources: ["TestHostApp.swift", "ContentView.swift"],
            swiftSettings: [
                .swiftLanguageMode(.v6)
            ]
        )
    ]
)
