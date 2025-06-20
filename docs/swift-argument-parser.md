# Swift Argument Parser: The Complete Reference (with a Dash of Charm)

> Based on [Swift ArgumentParser 1.5.1 Documentation](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser)

---

## Swift Argument Parser

Straightforward, type-safe argument parsing for Swift. If you want to build a CLI that's both robust and delightful, you're in the right place.

---

## Overview

By using `ArgumentParser`, you can create a command-line interface tool by declaring simple Swift types. Begin by declaring a type that defines the information you need to collect from the command line. Decorate each stored property with one of `ArgumentParser`'s property wrappers, declare conformance to [`ParsableCommand`](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/parsablecommand), and implement your command's logic in its `run()` method. For async renditions, use [`AsyncParsableCommand`](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/asyncparsablecommand).

```swift
import ArgumentParser

@main
struct Repeat: ParsableCommand {
    @Argument(help: "The phrase to repeat.")
    var phrase: String

    @Option(help: "The number of times to repeat 'phrase'.")
    var count: Int? = nil

    mutating func run() throws {
        let repeatCount = count ?? 2
        for _ in 0..<repeatCount {
            print(phrase)
        }
    }
}
```

When a user executes your command, the `ArgumentParser` library parses the command-line arguments, instantiates your command type, and then either calls your `run()` method or exits with a useful message.

![Repeat command output](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/images/ArgumentParser/repeat.png)

---

## Additional Resources
- [`ArgumentParser` on GitHub](https://github.com/apple/swift-argument-parser/)
- [`ArgumentParser` on the Swift Forums](https://forums.swift.org/c/related-projects/argumentparser/60)

---

## Topics

### Essentials
- [Getting Started with ArgumentParser](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/gettingstarted): Learn to set up and customize a simple command-line tool.
- [`protocol ParsableCommand`](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/parsablecommand): A type that can be executed as part of a nested tree of commands.
- [`protocol AsyncParsableCommand`](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/asyncparsablecommand): For async command execution.
- [Defining Commands and Subcommands](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/commandsandsubcommands): Break complex tools into a tree of subcommands.
- [Customizing Help for Commands](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/customizingcommandhelp): Make your help output shine.

### Arguments, Options, and Flags
- [Declaring Arguments, Options, and Flags](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/declaringarguments): Use the `@Argument`, `@Option`, and `@Flag` property wrappers to declare your CLI interface.
- [`struct Argument`](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/argument): For positional arguments.
- [`struct Option`](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/option): For named options.
- [`struct Flag`](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/flag): For Boolean switches.
- [`struct OptionGroup`](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/optiongroup): For grouping related options.
- [`protocol ParsableArguments`](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/parsablearguments): For types that can be parsed from command-line arguments.

### Property Customization
- [Customizing Help](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/customizinghelp): Provide rich help for arguments, options, and flags.
- [`struct ArgumentHelp`](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/argumenthelp): Help information for a command-line argument.
- [`struct ArgumentVisibility`](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/argumentvisibility): Control help visibility.
- [`struct NameSpecification`](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/namespecification): Specify argument labels.

### Custom Types
- [`protocol ExpressibleByArgument`](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/expressiblebyargument): Make your own types parseable from the command line.
- [`protocol EnumerableFlag`](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/enumerableflag): For enums that map to flags.

### Validation and Errors
- [Providing Custom Validation](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/validation): Throw a `ValidationError` for user-friendly error messages.
- [`struct ValidationError`](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/validationerror): Error type for parsing issues.
- [`struct CleanExit`](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/cleanexit): For clean exits.
- [`struct ExitCode`](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/exitcode): For custom exit codes.

### Shell Completion Scripts
- [Generating and Installing Completion Scripts](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/installingcompletionscripts): Generate scripts for Bash, Zsh, Fish, etc.
- [Customizing Completions](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/customizingcompletions): Suggest files, directories, or custom lists.
- [`struct CompletionKind`](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/completionkind): The type of completion to use for an argument or option.

#### Example: Custom Completions
```swift
struct Example: ParsableCommand {
    @Option(help: "The file to read from.", completion: .file())
    var input: String

    @Option(help: "The output directory.", completion: .directory)
    var outputDir: String

    @Option(help: "The preferred file format.", completion: .list(["markdown", "rst"]))
    var format: String

    enum CompressionType: String, CaseIterable, ExpressibleByArgument {
        case zip, gzip
    }

    @Option(help: "The compression type to use.")
    var compression: CompressionType
}

struct File: Hashable, ExpressibleByArgument {
    var path: String

    init?(argument: String) {
        self.path = argument
    }

    static var defaultCompletionKind: CompletionKind {
        .file()
    }
}

struct SwiftRun {
    @Option(help: "The target to execute.", completion: .custom(listExecutables))
    var target: String?
}

func listExecutables(_ arguments: [String]) -> [String] {
    // Generate the list of executables in the current directory
}
```

---

## OptionGroup

A wrapper that transparently includes a parsable type.

```swift
@propertyWrapper
struct OptionGroup<Value> where Value : ParsableArguments
```

Use an option group to include a group of options, flags, or arguments declared in a parsable type.

```swift
struct GlobalOptions: ParsableArguments {
    @Flag(name: .shortAndLong)
    var verbose: Bool

    @Argument var values: [Int]
}

struct Options: ParsableArguments {
    @Option var name: String
    @OptionGroup var globals: GlobalOptions
}
```

The flag and positional arguments declared as part of `GlobalOptions` are included when parsing `Options`.

---

## API Reference: Selected Properties & Methods

### Flag
- `var wrappedValue: Value { get set }` — The value presented by this property wrapper.
- [Flag.swift source](https://github.com/apple/swift-argument-parser/blob/1.5.1/Sources/ArgumentParser/Parsable%20Properties/Flag.swift#L99)

### FlagExclusivity
- `static var chooseLast: FlagExclusivity { get }` — The last enumeration case that is provided is used.
- `static var exclusive: FlagExclusivity { get }` — Only one of the enumeration cases may be provided.

### ValidationError
- `var message: String { get }` — The error message presented to the user when a `ValidationError` is thrown.

### ParsableCommand
- `static func main()` — Executes this command, or one of its subcommands, with the program's command-line arguments.
- [ParsableCommand.swift source](https://github.com/apple/swift-argument-parser/blob/1.5.1/Sources/ArgumentParser/Parsable%20Types/ParsableCommand.swift#L174)
- Instead of calling this method directly, you can add `@main` to the root command for your CLI tool.
- This method parses an instance of this type, one of its subcommands, or another built-in `ParsableCommand` type, from command-line arguments, and then calls its `run()` method, exiting with a relevant error message if necessary.

### ArgumentHelp
- `init(extendedGraphemeClusterLiteral value: Self.StringLiteralType)`
- `init(stringLiteral value: String)`
- `init(_ abstract: String = "", discussion: String = "", valueName: String? = nil, visibility: ArgumentVisibility = .default)`

### OptionGroup
- `var title: String` — The title to use in the help screen for this option group.
- `var wrappedValue: Value` — The value presented by this property wrapper.
- `var description: String` — String representation.

---

## See Also
- [Getting Started with ArgumentParser](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/gettingstarted)
- [Declaring Arguments, Options, and Flags](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/declaringarguments)
- [Customizing Help](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/customizinghelp)
- [Generating and Installing Completion Scripts](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/installingcompletionscripts)
- [Manual Parsing and Testing](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/manualparsing)
- [Experimental Features](https://swiftpackageindex.com/apple/swift-argument-parser/1.5.1/documentation/argumentparser/experimentalfeatures)

---

With `ArgumentParser`, your Swift CLI tools will be robust, user-friendly, and a joy to maintain. Now go forth and parse with confidence!

