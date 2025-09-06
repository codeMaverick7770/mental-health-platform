# Contributing to Mental Health Platform

Thank you for your interest in contributing to the Mental Health Platform! This document provides guidelines and information for contributors.

## 🎯 How to Contribute

### Reporting Issues
- Use the GitHub issue tracker
- Provide clear, detailed descriptions
- Include steps to reproduce bugs
- Specify your environment (OS, Node.js version, etc.)

### Suggesting Features
- Open an issue with the "enhancement" label
- Describe the feature and its benefits
- Consider the project's mental health focus
- Discuss implementation approach

### Code Contributions
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🏗️ Development Setup

### Prerequisites
- Node.js 16+
- Python 3.8+
- Git
- A code editor (VS Code recommended)

### Local Development
1. Clone your fork
2. Install dependencies (see README.md)
3. Set up environment variables
4. Run all services locally
5. Test your changes

### Code Style
- Follow existing patterns
- Use meaningful variable names
- Add comments for complex logic
- Keep functions focused and small

## 🧪 Testing Guidelines

### Before Submitting
- [ ] All services start without errors
- [ ] Voice assistant responds correctly
- [ ] TTS synthesis works
- [ ] Safety features function properly
- [ ] No console errors in browser
- [ ] API endpoints return expected responses

### Test Scenarios
1. **Basic Functionality**
   - Start a session
   - Send text input
   - Receive AI response
   - End session and generate report

2. **Voice Features**
   - Test speech recognition
   - Verify TTS playback
   - Check different voice modes

3. **Safety Features**
   - Test crisis keyword detection
   - Verify risk assessment
   - Check safety responses

## 📋 Pull Request Process

### Before Submitting
1. Ensure your branch is up to date
2. Run all tests
3. Update documentation if needed
4. Check for any linting errors

### PR Description
- Clearly describe what changes you made
- Explain why the changes were necessary
- Reference any related issues
- Include screenshots for UI changes

### Review Process
- Maintainers will review your code
- Address any feedback promptly
- Be open to suggestions and improvements
- Keep discussions constructive

## 🎨 UI/UX Guidelines

### Design Principles
- **Accessibility**: Ensure the interface is usable by everyone
- **Simplicity**: Keep the mental health focus clear
- **Calm**: Use soothing colors and clear typography
- **Privacy**: Make data handling transparent

### Voice Interface
- Provide clear audio feedback
- Show visual indicators for listening/speaking
- Handle errors gracefully
- Offer text input as fallback

## 🔒 Security Considerations

### Data Privacy
- Never log sensitive user data
- Use secure communication protocols
- Implement proper session management
- Follow data minimization principles

### Safety Features
- Maintain crisis detection accuracy
- Ensure proper risk escalation
- Test safety responses thoroughly
- Document safety procedures

## 📚 Documentation

### Code Documentation
- Comment complex algorithms
- Document API endpoints
- Explain configuration options
- Update README for new features

### User Documentation
- Keep setup instructions current
- Document all configuration options
- Provide troubleshooting guides
- Include examples and use cases

## 🐛 Bug Reports

### Good Bug Reports Include
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots or logs if relevant

### Bug Report Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Windows 10]
- Node.js version: [e.g. 16.14.0]
- Python version: [e.g. 3.9.7]

**Additional context**
Any other context about the problem.
```

## 💡 Feature Requests

### Good Feature Requests Include
- Clear problem statement
- Proposed solution
- Use cases and benefits
- Implementation considerations

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
A clear description of any alternative solutions.

**Additional context**
Add any other context or screenshots about the feature request.
```

## 🤝 Community Guidelines

### Be Respectful
- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Focus on what is best for the community
- Show empathy towards others

### Mental Health Focus
- Remember this is a mental health platform
- Be sensitive to mental health topics
- Prioritize user safety and well-being
- Consider the impact of changes on users

## 📞 Getting Help

- Check existing issues and discussions
- Ask questions in GitHub discussions
- Review the documentation
- Contact maintainers for urgent issues

## 🏆 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to making mental health support more accessible!
