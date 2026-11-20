<div align="center">

<img src="src/assets/number-guesser-logo-v4.svg" alt="Guess The Number logo" width="260" />

# Guess The Number

### Think smart. Read the clues. Crack the code.

A responsive number-guessing game with solo play, daily challenges, player profiles, friends, chat, and turn-based multiplayer matches.

<p>
  <a href="https://guess-the-number-livid-nu.vercel.app/"><strong>Play Live Demo</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/aman-165/Guess-The-Number"><strong>View Repository</strong></a>
</p>

![React](https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=FFD62E)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=222222)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)

</div>

---

## Table of Contents

- [Overview](#-overview)
- [Gameplay](#-gameplay)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Technology Stack](#-technology-stack)
- [Application Structure](#-application-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Supabase Backend](#-supabase-backend)
- [Available Scripts](#-available-scripts)
- [Deployment](#-deployment)
- [Security Notes](#-security-notes)
- [Future Improvements](#-future-improvements)
- [Author](#-author)
- [License](#-license)

## 🎮 Overview

**Guess The Number** is a browser-based logic game built with React. In the solo game, the player discovers a randomly generated five-digit code within a limited number of attempts. Each submitted guess returns per-digit colour feedback to help narrow down the answer.

The application also includes account-based features backed by Supabase: player profiles and statistics, daily challenges, friend connections, chat, challenge invitations, and multiplayer match history.

The interface includes desktop and mobile layouts, sound effects, music settings, and page-specific SEO metadata.

## 🧩 Gameplay

1. The game generates a secret code containing **five digits** (`0–9`).
2. The player has **five attempts** to guess the complete code.
3. Each submitted digit receives feedback:

| Colour | Meaning |
|---|---|
| 🟩 Green | Correct digit in the correct position. |
| 🟨 Yellow | Digit exists in the code but is in a different position. |
| ⬜ Grey | Digit does not appear among the remaining unmatched code digits. |

4. Guess the complete code before using all five attempts to win.
5. A leading zero is allowed.

The game supports keyboard navigation between digit inputs, paste handling, and the Enter key to submit a guess.

## ✨ Features

### Core game
- Five-digit number guessing gameplay with five attempts per standard round.
- Green, yellow, and grey digit feedback.
- Keyboard-friendly digit entry, navigation, and paste support.
- Pause, restart, win, and game-over states.
- Sound effects and background music controls.
- Best solo score stored in browser `localStorage`.

### Account and player experience
- Sign-up, login, forgot-password, and password-reset pages.
- Protected routes for account-only pages.
- Editable player profile and avatar handling.
- Public player profiles and player search.
- Player progress, XP levels, and single-player statistics.

### Challenges and multiplayer
- Daily challenge page and attempt tracking.
- Send and receive player challenges.
- Turn-based multiplayer match pages.
- Match guesses and feedback history.
- Challenge history and match history.

### Social features
- Friends list and friend requests.
- Player-to-player chat.
- In-app notifications.

### Interface and discoverability
- Responsive desktop and mobile presentation.
- Reusable React components and page-level styles.
- Lazy-loaded route pages.
- Page-specific title and description metadata.
- Canonical URL and social preview metadata when `VITE_SITE_URL` is configured.

> Account-based and multiplayer features depend on a correctly configured Supabase project, database functions, policies, and storage setup.

## 🖼️ Screenshots

The supplied screenshots show desktop and mobile interface previews.

### Main experience

| Home | Solo gameplay |
|---|---|
| ![Home page](docs/screenshots/home.png) | ![Solo gameplay](docs/screenshots/single-player-gameplay.png) |

| Daily challenge | Game rules |
|---|---|
| ![Daily challenge](docs/screenshots/daily-challenge.png) | ![Game rules](docs/screenshots/game-rules.png) |

### Authentication

| Sign up | Login |
|---|---|
| ![Sign up](docs/screenshots/signup.png) | ![Login](docs/screenshots/login.png) |

| Forgot password | Reset password |
|---|---|
| ![Forgot password](docs/screenshots/forgot-password.png) | ![Reset password](docs/screenshots/reset-password.png) |

### Social experience

| Friends | Find players |
|---|---|
| ![Friends](docs/screenshots/friends.png) | ![Find players](docs/screenshots/find-players.png) |

| Friend requests | Chat |
|---|---|
| ![Friend requests](docs/screenshots/friend-requests.png) | ![Chat](docs/screenshots/chat.png) |

### Challenges and multiplayer

| Incoming challenges | Outgoing challenges |
|---|---|
| ![Incoming challenges](docs/screenshots/incoming-challenges.png) | ![Outgoing challenges](docs/screenshots/outgoing-challenges.png) |

| Multiplayer match | Challenge history |
|---|---|
| ![Multiplayer match](docs/screenshots/multiplayer-match.png) | ![Challenge history](docs/screenshots/challenge-history.png) |

### Profile and settings

| Player profile | Match history |
|---|---|
| ![Player profile](docs/screenshots/profile.png) | ![Match history](docs/screenshots/match-history.png) |

| Notifications | Sound settings |
|---|---|
| ![Notifications](docs/screenshots/notifications.png) | ![Sound settings](docs/screenshots/sound-settings.png) |

## 🛠️ Technology Stack

| Technology | Usage |
|---|---|
| [React 19](https://react.dev/) | Component-based user interface |
| [Vite 7](https://vite.dev/) | Development server and production build |
| JavaScript (ES modules) | Application logic |
| CSS | Layout, responsive styling, and visual design |
| [React Router DOM 7](https://reactrouter.com/) | Client-side routing and protected routes |
| [Supabase](https://supabase.com/) | Authentication, database access, RPC calls, and avatar storage integration |
| [Recharts](https://recharts.org/) | Data visualisation components |
| [Vercel](https://vercel.com/) | Live deployment |

## 📁 Application Structure

```text
Guss-the-number/
├── public/
│   ├── sounds/
│   ├── number-guesser-logo-v4.svg
│   ├── robots.txt
│   └── sitemap.xml
├── docs/
│   └── screenshots/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── GuestRoute.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── Navbar.jsx
│   │   ├── SEO.jsx
│   │   └── ...
│   ├── context/
│   │   ├── SoundContext.jsx
│   │   └── ToastContext.jsx
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── pages/
│   │   ├── Game.jsx
│   │   ├── DailyChallenge.jsx
│   │   ├── MultiplayerMatch.jsx
│   │   ├── Profile.jsx
│   │   ├── Friends.jsx
│   │   ├── Chat.jsx
│   │   └── ...
│   ├── styles/
│   ├── utils/
│   │   ├── soundManager.js
│   │   └── xpSystem.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (a current supported LTS release is recommended).
- npm (included with Node.js).
- A Supabase project for authentication and backend-powered features.

### 1. Clone the repository

```bash
git clone https://github.com/aman-165/Guess-The-Number.git
cd Guess-The-Number
```

### 2. Install dependencies

```bash
npm install
```

For reproducible installation from the committed lockfile:

```bash
npm ci
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_SITE_URL=http://localhost:5173
```

Use the URL and publishable key from your own Supabase project. Do not commit real credentials.

### 4. Start the development server

```bash
npm run dev
```

Vite prints the local development URL in the terminal. Open that URL in your browser.

## 🔐 Environment Variables

| Variable | Required | Purpose |
|---|---:|---|
| `VITE_SUPABASE_URL` | Yes, for Supabase features | Supabase project URL used by the client. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes, for Supabase features | Supabase publishable key used to initialise the client. |
| `VITE_SITE_URL` | Optional | Base website URL used to build canonical URLs and social metadata. |

For production, set `VITE_SITE_URL` to the deployed website's canonical origin.

**Security:** Vite exposes variables prefixed with `VITE_` to browser-side code. Only use a Supabase publishable key here. Never put a Supabase `service_role` key, database password, or other private secret in a frontend environment variable.

## 🗄️ Supabase Backend

The frontend initialises its Supabase client in `src/lib/supabaseClient.js`.

The supplied database metadata identifies these tables:

| Table | Purpose indicated by its name and columns |
|---|---|
| `profiles` | Player identity and profile information |
| `challenges` | Player challenge invitations and status |
| `matches` | Multiplayer match records and state |
| `match_guesses` | Guesses submitted during multiplayer matches |
| `match_secrets` | Secret number associated with a match |
| `friendships` | Friend requests and friendship status |
| `chat_messages` | Player-to-player messages |
| `notifications` | User notifications and read status |
| `daily_challenges` | Daily challenge date and secret number |
| `daily_challenge_attempts` | User attempts and completion results |
| `player_progress` | Player XP total |
| `single_player_stats` | Solo games, wins, losses, and best score |
| `xp_transactions` | XP events and transaction amounts |

The application calls these Supabase database functions (RPCs):

- `save_single_player_result`
- `get_daily_challenge_status`
- `submit_daily_challenge_guess`
- `send_friend_request`
- `create_match_from_challenge`
- `submit_match_guess`
- `get_public_player_stats`

### Backend setup requirements

To run the full application against a new Supabase project, configure the backend to match the frontend's data model:

1. Create or apply the required database tables and relationships.
2. Implement the RPC functions called by the application.
3. Configure Row Level Security (RLS) policies for the relevant tables.
4. Configure the avatar storage bucket and its access policies.
5. Enable and configure the authentication options used by the application.
6. Set the local and production environment variables.

The supplied project materials include table/column and constraint exports, but not complete SQL migrations, RLS policies, storage policies, or RPC function definitions. This README therefore does not claim to provide a one-click Supabase database installation.

## 📜 Available Scripts

These scripts are defined in `package.json`.

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Creates the production build in `dist/`. |
| `npm run preview` | Serves the production build locally for preview. |
| `npm run lint` | Runs ESLint checks. |

## ☁️ Deployment

The current live application is hosted on Vercel:

**[https://guess-the-number-livid-nu.vercel.app/](https://guess-the-number-livid-nu.vercel.app/)**

For a Vercel deployment:

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Use the Vite framework preset.
4. Set the build command to `npm run build`.
5. Set the output directory to `dist`.
6. Add the required Supabase environment variables in Vercel project settings.
7. Set `VITE_SITE_URL` to the production website URL.
8. Deploy and verify the application and Supabase-backed flows.

If you use a custom domain later, update `VITE_SITE_URL` to that domain and verify the authentication redirect URLs in Supabase.

## 🔒 Security Notes

- Keep `.env.local` out of Git.
- Never expose private Supabase credentials in frontend code.
- Use Row Level Security to protect user-owned records and multiplayer data.
- Apply appropriate policies to the avatar storage bucket.
- Configure authentication redirect URLs for each environment.
- Review database function permissions before enabling public access.

## 🧭 Future Improvements

Potential improvements for future versions:

- Add automated tests for game rules and important user flows.
- Add documented Supabase migrations and backend setup scripts.
- Add CI checks for linting and production builds.
- Improve accessibility testing across interactive game controls.
- Add a dedicated contribution guide for external contributors.

These are suggestions, not claims about existing functionality.

## 👨‍💻 Author

**NONE**

- GitHub: [@aman-165](https://github.com/aman-165)
- Project repository: [Guess-The-Number](https://github.com/aman-165/Guess-The-Number)
- Live application: [Play Guess The Number](https://guess-the-number-livid-nu.vercel.app/)

## 📄 License

No `LICENSE` file was present in the supplied project files. Until a license is added to the repository, reuse, modification, and distribution permissions are not explicitly granted by an open-source license.

---

<div align="center">

**Thanks for checking out Guess The Number!**

If you enjoy the project, consider giving the repository a ⭐ on GitHub.

</div>
