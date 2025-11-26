# Product Overview - 서울경제 뉴스게임 플랫폼

## Purpose
Interactive quiz game platform that transforms economic news into engaging educational games. Helps users learn about economics, finance, and current events through gamified experiences.

## Value Proposition
- **Educational**: Learn complex economic concepts through interactive gameplay
- **Current**: Quiz content based on real-time economic news from BigKinds API
- **Engaging**: Multiple game formats (BlackSwan, Prisoner's Dilemma, Signal Decoding, Card Matching)
- **AI-Powered**: RAG-based chatbot provides contextual explanations using Claude 3 Sonnet
- **Accessible**: Static site deployment ensures fast loading and high availability

## Key Features

### 4 Game Types
1. **BlackSwan (g1)**: Economic event prediction game - identify unexpected market events
2. **Prisoner's Dilemma (g2)**: Economic dilemma scenarios - strategic decision making
3. **Signal Decoding (g3)**: Economic signal interpretation - decode market indicators
4. **Card Matching (quizlet)**: Economic term matching - vocabulary building

### Dynamic Quiz System
- Admin panel for creating/editing/deleting quizzes
- Multiple questions per date support
- Both multiple-choice and short-answer formats
- Related news article integration
- Tag-based categorization

### AI Chatbot (RAG-based)
- Context-aware responses using quiz content and related articles
- BigKinds API integration for latest economic news (30-day window)
- Game-specific system prompts for specialized responses
- 250-350 character concise answers
- Intelligent fallback mechanisms

### Archive System
- Browse past quizzes by date
- Dynamic loading from DynamoDB via Lambda API
- Multi-layer caching (memory, localStorage, API)
- Automatic cache invalidation on content updates

### Admin Panel
- Password-protected access (sessionStorage-based)
- Quiz management (create, edit, delete)
- Quizlet CSV upload for card matching games
- Cache management tools
- Preview functionality before publishing

## Target Users

### Primary Users
- **Students**: Learning economics and finance concepts
- **Professionals**: Staying updated on economic news
- **General Public**: Interested in economic literacy

### Admin Users
- **Content Creators**: Seoul Economic Daily staff
- **Editors**: Managing quiz content and quality
- **Administrators**: System maintenance and monitoring

## Use Cases

### Learning Path
1. User visits game hub → selects game type
2. Views archive → picks date/topic of interest
3. Plays quiz → receives immediate feedback
4. Uses AI chatbot → gets detailed explanations
5. Reviews completion screen → sees performance summary

### Content Management
1. Admin logs in → accesses admin panel
2. Creates new quiz → adds multiple questions
3. Previews content → verifies accuracy
4. Publishes → automatically invalidates cache
5. Monitors → checks user engagement

### Daily Engagement
1. New quiz published daily based on economic news
2. Users return for fresh content
3. Archive grows as knowledge repository
4. Social sharing drives new user acquisition

## Technical Highlights
- **Hybrid Architecture**: Static frontend + dynamic API backend
- **Performance**: Multi-layer caching, CDN delivery via CloudFront
- **Scalability**: Serverless Lambda functions, DynamoDB auto-scaling
- **SEO-Friendly**: Static HTML generation for all pages
- **Keyboard Shortcuts**: A/B/C/D keys for quick answer selection
- **Responsive Design**: Mobile-first approach with adaptive layouts

## Success Metrics
- Daily active users and quiz completion rates
- Average time spent per quiz session
- AI chatbot interaction frequency
- Archive browsing patterns
- Content creation velocity (admin side)
