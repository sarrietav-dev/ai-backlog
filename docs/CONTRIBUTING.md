# 🤝 Contributing to AI Product Backlog

We love your input! We want to make contributing to AI Product Backlog as easy and transparent as possible.

## 🚀 Quick Start

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test your changes**: `npm run dev`
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Submit a Pull Request**

## 📋 Development Setup

### Prerequisites
- Node.js 18+
- Git
- Supabase account
- OpenAI API key

### Local Setup
```bash
# Clone your fork
git clone https://github.com/yourusername/ai-backlog.git
cd ai-backlog

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Fill in your environment variables

# Start development server
npm run dev
```

## 🎯 How to Contribute

### 🐛 Bug Reports

**Before submitting a bug report:**
- Check existing issues
- Update to the latest version
- Test in incognito/private mode

**When submitting:**
- Use the bug report template
- Include steps to reproduce
- Add screenshots if helpful
- Mention your environment (OS, browser, etc.)

### ✨ Feature Requests

**Before requesting:**
- Check existing feature requests
- Consider if it fits the project scope

**When requesting:**
- Use the feature request template
- Explain the problem you're solving
- Describe your proposed solution
- Consider implementation complexity

### 🔧 Code Contributions

#### Areas We Need Help
- **AI Optimization**: Better prompts, model selection
- **UI/UX**: Component improvements, accessibility
- **Performance**: Caching, optimization
- **Testing**: Unit tests, integration tests
- **Documentation**: Guides, examples
- **Integrations**: Export features, third-party APIs

#### Code Style

We use **Prettier** and **ESLint**:

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type checking
npm run type-check
```

#### Component Guidelines

**React Components:**
```typescript
// Use TypeScript
interface Props {
  title: string
  optional?: boolean
}

// Export as default
export default function Component({ title, optional = false }: Props) {
  return <div>{title}</div>
}
```

**File Naming:**
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Pages: `kebab-case.tsx`

#### Database Changes

**Migrations:**
```sql
-- supabase/migrations/YYYYMMDD_description.sql
-- Add your SQL here
```

**Testing migrations:**
```bash
# Reset local database
supabase db reset

# Test migration
supabase db push
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- ComponentName
```

### Writing Tests
```typescript
// components/__tests__/Component.test.tsx
import { render, screen } from '@testing-library/react'
import Component from '../Component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

## 📚 Documentation

### README Updates
- Keep examples current
- Update installation steps
- Add new features

### Code Documentation
```typescript
/**
 * Generates user stories from a conversation
 * @param messages - Array of chat messages
 * @param backlogId - UUID of the backlog
 * @returns Promise<UserStory[]>
 */
export async function generateStories(
  messages: ChatMessage[],
  backlogId: string
): Promise<UserStory[]> {
  // Implementation
}
```

## 🎨 Design Guidelines

### UI Components
- Use **shadcn/ui** components as base
- Follow existing design patterns
- Ensure accessibility (ARIA labels, keyboard navigation)
- Test in dark/light modes

### Color Palette
```css
/* Primary brand colors */
--primary: hsl(222.2 84% 4.9%)
--primary-foreground: hsl(210 40% 98%)

/* Semantic colors */
--success: hsl(142.1 76.2% 36.3%)
--warning: hsl(38.1 92.1% 50%)
--error: hsl(0 84.2% 60.2%)
```

## 🔄 Pull Request Process

### Before Submitting
1. **Update your branch**: `git rebase main`
2. **Run tests**: `npm test`
3. **Lint code**: `npm run lint`
4. **Build successfully**: `npm run build`

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here
```

### Review Process
1. **Automated checks** must pass
2. **Code review** by maintainer
3. **Testing** in preview environment
4. **Approval** and merge

## 🏷️ Commit Messages

Follow **Conventional Commits**:

```bash
# Feature
feat: add story export functionality

# Bug fix
fix: resolve chat message duplication

# Documentation
docs: update API documentation

# Refactor
refactor: optimize database queries

# Test
test: add unit tests for story generation
```

## 🌟 Recognition

Contributors are recognized in:
- **README** contributor section
- **CHANGELOG** for significant contributions
- **GitHub** contributor graphs
- **Special mentions** in releases

## 📞 Getting Help

- **Discord**: [Join our community](https://discord.gg/ai-backlog)
- **Issues**: Use GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **Email**: maintainer@ai-backlog.com

## 🎉 First Time Contributors

Look for issues labeled:
- `good first issue`
- `beginner friendly`
- `documentation`
- `help wanted`

Don't hesitate to ask questions!

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to AI Product Backlog! 🙏** 