import ArgumentParser
import Foundation

@main
@available(macOS 14.0, *)
struct PeepItCommand: AsyncParsableCommand {
    static let configuration = CommandConfiguration(
        commandName: "peepit",
        abstract: "A macOS utility for screen capture, application listing, and window management",
        usage: "peepit <subcommands>",
        version: Version.current,
        subcommands: [ImageCommand.self, ListCommand.self],
        defaultSubcommand: ImageCommand.self
    )

    func run() async throws {
        // Root command doesn't do anything, subcommands handle everything
    }
}
