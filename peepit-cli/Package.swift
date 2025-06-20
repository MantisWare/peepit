// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "peepit",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(
            name: "peepit",
            targets: ["peepit"]
        )
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-argument-parser", from: "1.0.0")
    ],
    targets: [
        .executableTarget(
            name: "peepit",
            dependencies: [
                .product(name: "ArgumentParser", package: "swift-argument-parser")
            ],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .unsafeFlags(["-parse-as-library"])
            ]
        ),
        .testTarget(
            name: "peepitTests",
            dependencies: ["peepit"],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency")
            ]
        )
    ]
)
