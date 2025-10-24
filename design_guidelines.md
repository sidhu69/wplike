# Design Guidelines: WhatsApp-Like Mobile Messaging PWA

## Design Approach

**Reference-Based Approach**: Drawing primary inspiration from WhatsApp's proven mobile messaging patterns, with secondary influences from Telegram (for sleek animations) and Signal (for clean information hierarchy). This approach prioritizes familiarity, ease of use, and instant recognition for mobile users.

**Core Design Principles:**
- Mobile-first with thumb-friendly tap targets (minimum 44px)
- Instant visual feedback for all interactions
- Clear message hierarchy and conversation flow
- Minimal cognitive load with familiar patterns
- Performance-optimized for real-time updates

---

## Typography System

**Font Stack**: Roboto (primary), system-ui fallback
- Use Google Fonts CDN for Roboto (400, 500, 700 weights)

**Type Scale:**
- Screen Titles: text-xl font-medium (20px) - for page headers
- Chat Names: text-base font-medium (16px) - conversation list names
- Message Text: text-sm (14px) - primary chat content
- Timestamps: text-xs (12px) - message times, last seen
- Ranking Numbers: text-2xl font-bold (24px) - leaderboard positions
- Coin Counts: text-lg font-semibold (18px) - reward displays

**Hierarchy Rules:**
- Bold weights for user names and rankings only
- Regular weight for all body text and messages
- Subtle size differences maintain readability without overwhelming

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 3, 4, 6, 8, 12, 16
- Micro spacing (p-2, gap-2): Between icons and text, tight layouts
- Standard spacing (p-4, gap-4): Default component padding, list items
- Section spacing (p-6, gap-6): Screen padding, card separation
- Large spacing (p-8, p-12): Top/bottom page spacing, empty states

**Screen Structure:**
```
Mobile viewport (375px base, up to 428px)
- Full-height screens with fixed headers and footers
- Safe area padding for notched devices (pt-safe)
- Bottom navigation: h-16 with 4-5 nav items
- Top headers: h-14 with title and action buttons
- Content area: flex-1 with overflow-scroll
```

**Grid System for Rankings:**
- Single column for chat lists and profiles
- Leaderboard cards: full-width with internal flex layout
- Top 3 users: Larger cards (h-20) with special treatment
- Remaining users (4-50): Compact cards (h-14)

---

## Component Library

### Navigation Components

**Bottom Navigation Bar:**
- Fixed at bottom with 4 tabs: Chats, Rankings, Profile, (Optional: Status)
- Each tab: Icon (24px) + Label (text-xs)
- Active state: Distinct styling with selected indicator
- Icons: Use Heroicons via CDN (outline for inactive, solid for active)

**Top Header Bar:**
- Fixed at top: h-14
- Left: Back button or hamburger (touch target: 44px)
- Center: Screen title (text-xl font-medium)
- Right: Search icon, menu dots, or action buttons
- Subtle bottom border for depth

### Chat Components

**Conversation List Item:**
- Height: h-18 (72px)
- Layout: Avatar (48px circle) + Name/Message preview + Time/Badge
- Avatar on left with p-3 spacing
- Two-line text: Name (text-base font-medium) + Last message (text-sm truncate)
- Right side: Timestamp (text-xs) + Unread badge (circular, 20px min)
- Horizontal divider between items (subtle, 1px)

**Message Bubbles:**
- Sent messages: Aligned right with max-w-[80%]
- Received messages: Aligned left with max-w-[80%]
- Padding: px-3 py-2 inside bubble
- Rounded corners: rounded-2xl (with directional tail effect via rounded-br-sm for sent, rounded-bl-sm for received)
- Timestamps: text-xs below bubble, right-aligned for sent
- Read receipts: Checkmarks (16px icons) next to timestamp

**Media Message Cards:**
- Images: max-h-64 with rounded-xl, tap to fullscreen
- Voice notes: Horizontal waveform + play button + duration (h-12)
- Camera/Gallery: Icon buttons (44px) in input area

**Chat Input Bar:**
- Fixed at bottom: h-14 minimum (expands with multi-line)
- Left: Attachment icon (camera/gallery - 40px tap target)
- Center: Text input (flex-1, rounded-full, px-4)
- Right: Voice note button OR send button (conditional, 40px)
- Input background: Distinct from message area

### Ranking Components

**Tab Switcher:**
- 4 tabs: Daily, Weekly, Monthly, Annual
- Horizontal scroll if needed on small screens
- Each tab: px-4 py-2, text-sm font-medium
- Active tab: Underline indicator (h-1, width animation)

**Leaderboard Card:**
- Full-width with rounded-lg
- Top 3 podium style: Larger cards with medal icons
  - 1st: text-2xl ranking number, special treatment
  - 2nd-3rd: text-xl ranking number
- Rank 4-50: Standard cards
  - Layout: Rank number (w-8) + Avatar (40px) + Name + Message count + Coin icon
  - Even/odd row distinction for scannability

**Coin Prize Display:**
- Sticky header or card showing current prize pool
- Large coin icon (48px) + Amount (text-2xl font-bold)
- Subtitle: "Win by ranking #1" (text-sm)

### Profile Components

**Profile Header:**
- Centered layout with large avatar (96px) tapable for edit
- Name (text-2xl font-semibold) centered below
- Edit icon overlay on avatar (24px, bottom-right)
- Stats row: Messages sent, Current rank (text-sm, gap-8)

**Settings List:**
- Full-width list items (h-14)
- Icon (24px) + Label (text-base) + Chevron right (20px)
- Sections: Account, Privacy, Notifications, Blocked Contacts
- Dividers between sections (thicker, 8px gap)

**Blocked Contacts List:**
- Similar to chat list layout
- Avatar + Name + "Unblock" button (text-sm, tap target 44px)

### Onboarding Components

**Profile Setup Screens:**
- Single-step per screen approach
- Screen 1: Name input (large, centered)
- Screen 2: Profile picture upload (camera or gallery options)
- Large tap targets for camera/gallery: min h-32
- "Continue" button: Full-width at bottom, h-12

**Friend Search:**
- Top search bar: h-12, rounded-full, with search icon
- Results list: Same as conversation list styling
- "Add" button on right: Circular or pill-shaped (h-8)

### Empty States

**No Chats Yet:**
- Centered icon (80px) + Heading + Description
- CTA button: "Start a conversation" (h-12, rounded-full)

**No Rankings Data:**
- Icon + "Start chatting to appear on leaderboards"

---

## Interaction Patterns

**Tap Targets:** Minimum 44px x 44px for all interactive elements
**Touch Feedback:** Immediate visual response (subtle scale or opacity change)
**Swipe Actions:** Left swipe on chat items for delete/archive/mute
**Pull-to-Refresh:** On chat list and ranking tabs
**Loading States:** Skeleton screens for chat list, shimmer effect for loading messages
**Transitions:** Smooth page transitions (slide left/right), message appear animations (fade + slide up)

---

## Images

**Profile Avatars:**
- User avatars: 48px (chat list), 40px (rankings), 96px (profile page)
- Default avatars: Initials-based colored circles when no photo uploaded
- Upload via camera or gallery with preview and crop

**Media in Chats:**
- Inline image thumbnails: max-h-64, tap for fullscreen modal
- Gallery selection: Grid of recent photos
- Camera capture: Full-screen viewfinder with capture button

**Empty State Illustrations:**
- Simple line icons or illustrations for empty chats, no friends, etc.
- Centered, max-w-48, with supporting text below

**No Hero Image**: This is a mobile app, not a marketing site

---

## Accessibility & Performance

- Consistent keyboard navigation and focus indicators
- Clear color contrast for all text (maintain WCAG AA)
- Touch-optimized: All buttons 44px minimum, generous tap areas
- Optimistic UI updates: Show sent messages immediately, sync in background
- Lazy loading for chat history and ranking lists
- Efficient re-renders: Virtualized lists for long chat histories
- Offline support: PWA caching for shell, sync when online

---

## Mobile-Specific Optimizations

- Fixed headers/footers to maximize content area
- Safe area insets for notched devices
- Prevent zoom on input focus (viewport meta)
- Gesture-based navigation where appropriate
- Minimize vertical scrolling within conversations (messages flow naturally)
- Bottom-sheet modals for contextual actions (better thumb reach)
- Haptic feedback for important actions (send message, voice record)