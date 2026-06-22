# pptb-solution-health-checker

![Solution Health Checker](docs/assets/social-preview.png)

> Comprehensive governance health checks for your Power Platform solutions.

![Version](https://img.shields.io/badge/version-0.0.1-blue)
![Status](https://img.shields.io/badge/status-stable-green)

This tool analyses the health of your Power Platform solutions, surfacing governance issues across schema, security, ALM, flow, and capacity with actionable findings and remediation guidance.


## 🎯 What is Solution Health Checker?

## ✨ Key Features

## 🚀 Quick Start

## 📸 Screenshots

### Scope Selection
Choose what to document - by publisher or solution with multi-select filtering.

![Scope Selection](docs/screenshots/PPSB-1-What%20to%20document-selector.png)

### Screenshot 1
Screenshot 1

### Screenshot 2
Screenshot 1

## 💡 Use Cases

### Architecture Documentation
- **Onboarding**: Generate complete system docs for new team members joining projects
- **Proposals**: Create technical specifications and architecture diagrams for client proposals
- **Handover**: Provide comprehensive documentation during project transitions

## 🔧 Technical Stack

- **Language**: TypeScript 5.x (strict mode)
- **UI Framework**: React 18 + Vite 5
- **Component Library**: Fluent UI v9 (Microsoft Design System)
- **Diagrams**: Cytoscape.js (interactive ERD) · Mermaid (execution pipeline export in HTML/Markdown)
- **Export**: JSZip (multi-file packages)
- **Architecture**: Flat structure with separated core logic (`src/core/`) and React UI (`src/components/`)

🏗️ **[Architecture Details](docs/architecture.md)** |
🛣️ **[Roadmap](docs/roadmap.md)**

---

## 🤖 AI-Assisted Development

This project uses Claude Code with custom sub-agents defined in `.claude/agents/`.
Shared agent memory (decisions, patterns, learnings) lives in `.claude/memory/`.
If contributing, agents will automatically load this context.

---

## 🚦 Installation

### For PPTB Desktop Users

1. Available in the PPTB Marketplace

### For Development

```bash
# Clone repository
git clone https://github.com/aidevme/pptb-solution-health-checker.git
cd pptb-solution-health-checker

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Type check
pnpm typecheck
```

**Development Requirements:**
- Node.js 18+ and pnpm 8+
- PPTB Desktop for testing (connects to Dataverse)
- Windows, macOS, or Linux

---

## 📚 Documentation

Comprehensive documentation for all aspects of PPSB:

- **[User Guide](docs/user-guide.md)** - Complete usage instructions from scope selection to export
- **[Architecture](docs/architecture.md)** - Technical design, component structure, and extension points
- **[API Security](docs/API_SECURITY.md)** - Complete API reference, security considerations, and data access documentation
- **[Roadmap](docs/roadmap.md)** - Future versions (baseline comparison, CLI, CI/CD integration)
- **[Examples](docs/examples/)** - Sample outputs and documentation structure
  - [Output Structure](docs/examples/example-output-structure.md)
  - [Sample ERD](docs/examples/sample-erd.md)
  - [Sample Entity Documentation](docs/examples/sample-entity-doc.md)
- **[Changelog](CHANGELOG.md)** - Version history and release notes

---

## 🙏 Credits & Acknowledgments

### Development Team
- **Primary Developer**: [AIDEVME](https://github.com/aidevme)

### AI Collaboration

This project was developed with significant AI assistance:

- **Claude Code (Anthropic)**: Initial brainstorming, concept validation, feature ideation, and requirements exploration. Helped refine the vision for what the Solution Health Checker should be and validated technical approaches.

- **Claude (Anthropic)**: Detailed architecture design, comprehensive implementation planning, and hands-on code development via **Claude Code**. Provided deep technical expertise for TypeScript/React implementation, Dataverse API integration, performance optimization strategies, and accessibility compliance.

- **[Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs) (Anthropic)**: UI/UX design direction, component layout, visual hierarchy, and design system guidance using Fluent UI v9 tokens and patterns.

The combination of AI tools accelerated development while maintaining high code quality and architectural consistency. ChatGPT helped explore possibilities and refine the product vision, while Claude provided meticulous technical implementation with thousands of lines of production-ready code.

**AI Development Approach:**
- Architecture designed through iterative collaboration with Claude
- Implementation executed via Claude Code (AI-assisted coding)
- Code reviews and optimization suggestions from both AI assistants
- Documentation structure and content refined with AI input

### Technology

- **PPTB Desktop** - [Power Platform Toolbox](https://www.powerplatformtoolbox.com/) (platform for PPSB deployment)
- **Microsoft Dataverse** - Data platform and APIs
- **Fluent UI** - Microsoft's design system and React components
- **Cytoscape.js** - Interactive ERD graph engine (force-directed, pan/zoom/export)
- **Mermaid** - Diagram rendering for execution pipeline visualizations in HTML/Markdown exports
- **TypeScript** - Language and type system
- **React** - UI framework
- **Vite** - Build tool and development server

### Open Source Libraries

- JSZip (ZIP file generation)
- Various TypeScript utilities and type definitions

### Community

Thanks to the Power Platform community for inspiration, feedback, and the collective knowledge that shaped PPSB's feature set and use cases.

---

## 🛣️ Roadmap Highlights

PPSB is under active development with exciting features planned:

**Baseline Comparison & Automation**
- Baseline comparison (load previous JSON and detect changes)
- Change detection with risk assessment
- Command-line interface (CLI) for automation
- CI/CD integration (GitHub Actions, Azure DevOps)

**Enhanced Analysis**
- Impact analysis ("What breaks if I delete this?")
- Unused component detection
- Business process mining
- Custom analysis rules

**Extended Platform Support**
- Canvas Apps (basic metadata discovery now supported; enhanced screen analysis planned)
- Power Pages (forms, lists, Liquid templates)
- Customer Insights & Marketing (journeys, segments, email templates)
- Additional component types (30+ new types)

**Enterprise Features**
- Performance benchmarking
- Multi-environment comparison
- Multi-tenant support
- Advanced visualizations and AI-powered insights

📖 **[Full Roadmap](docs/roadmap.md)**

---

## 📄 License

[MIT License](LICENSE)

Copyright © 2026 AIDEVME. All rights reserved.

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/aidevme/pptb-solution-health-checker/issues) - Report bugs or request features
- **Discussions**: [GitHub Discussions](https://github.com/aidevme/pptb-solution-health-checker/discussions) - Ask questions and share ideas
- **Documentation**: [docs/](docs/) - Comprehensive guides and examples

---

## 🤝 Contributing

Contributions are welcome! Whether it's a new rule, a bug fix, or a docs improvement — please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

- **New rules**: Add to the appropriate rule pack in `src/engine/rulePacks/` and document in `RULES.md`
- **Bug reports**: Open an issue with steps to reproduce
- **Feature requests**: Open an issue before writing code

---

## 🌟 Quick Links

- [Installation](#installation)
- [User Guide](docs/user-guide.md)
- [Architecture](docs/architecture.md)
- [Roadmap](docs/roadmap.md)
- [Changelog](CHANGELOG.md)
- [Examples](docs/examples/)

---

**Made with ❤️ for the Power Platform community**