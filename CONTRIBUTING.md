# Contributing to Portlens

First off, thank you for considering contributing to Portlens! It is people like you who make the open-source community such an amazing place to learn, inspire, and create.

This project was started by **Timothy T. Joe (@timtjoe)** and is currently in active development.

## How Can I Contribute?

### Reporting Bugs
* **Check the Doctor:** Before reporting, run `portlens doctor` to ensure it isn't a local configuration issue.
* **Use the Template:** Use the GitHub Issue tracker to describe the bug, including your OS and Framework.

### Suggesting Enhancements
* Open an issue with the tag `enhancement`.
* Describe the specific use case where the current version of Portlens falls short.

### Pull Requests
1.  Fork the repository.
2.  Create your feature branch: `git checkout -b feature/AmazingFeature`.
3.  Ensure your code follows the existing Strategy/Factory patterns.
4.  Commit your changes: `git commit -m 'Add some AmazingFeature'`.
5.  Push to the branch: `git push origin feature/AmazingFeature`.
6.  Open a Pull Request.

## Development Setup
Portlens uses **Bun** for development and **tsup** for building.

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build the project
bun run build