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
| ![Home page]<img width="1280" height="720" alt="home" src="https://github.com/user-attachments/assets/4986932d-50a3-4806-94f1-5dd582e51fe2" /> | ![Solo gameplay]<img width="1280" height="720" alt="single-player-gameplay" src="https://github.com/user-attachments/assets/cb349295-19f9-4ae0-85d9-448fc5da6018" /> |

| Daily challenge | Game rules |
|---|---|
| ![Daily challenge]<img width="1280" height="720" alt="daily-challenge" src="https://github.com/user-attachments/assets/af488146-9d01-45d6-b1bd-17423f45352c" /> | ![Game rules]<img width="1280" height="720" alt="game-rules" src="https://github.com/user-attachments/assets/3cff53f8-cd52-4855-9b4d-791ccbcfcbb5" /> |

### Authentication

| Sign up | Login |
|---|---|
| ![Sign up]<img width="1280" height="720" alt="signup" src="https://github.com/user-attachments/assets/0902fee2-4c8e-4bf1-af22-752f50608793" /> | ![Login]<img width="1280" height="720" alt="login" src="https://github.com/user-attachments/assets/64476578-9a5a-48bb-8e88-785267120b07" /> |

| Forgot password | Reset password |
|---|---|
| ![Forgot password]<img width="1280" height="720" alt="forgot-password" src="https://github.com/user-attachments/assets/47b2ed67-8a58-497e-be98-843553c2d265" /> | ![Reset password]<img width="1280" height="720" alt="reset-password" src="https://github.com/user-attachments/assets/033ce0d5-f5dd-4df8-96bf-31af8a25ae19" /> |

### Social experience

| Friends | Find players |
|---|---|
| ![Friends]<img width="1280" height="720" alt="friends" src="https://github.com/user-attachments/assets/568b5ab4-1485-4a46-92c7-9e81967018e9" /> | ![Find players]<img width="1280" height="720" alt="find-players" src="https://github.com/user-attachments/assets/356f837e-f79e-416e-a39c-c93457abb863" /> |

| Friend requests | Chat |
|---|---|
| ![Friend requests]<img width="1280" height="720" alt="friend-requests" src="https://github.com/user-attachments/assets/5a57219f-f187-4bbf-9c3d-6e7ecec034bc" /> | ![Chat]<img width="1280" height="720" alt="chat" src="https://github.com/user-attachments/assets/0109af35-5116-4a09-a559-93014e5a9c9b" /> |

### Challenges and multiplayer

| Incoming challenges | Outgoing challenges |
|---|---|
| ![Incoming challenges]<img width="1280" height="720" alt="incoming-challenges" src="https://github.com/user-attachments/assets/6902db27-1994-4f37-ada0-b4a4c522b8ae" /> | ![Outgoing challenges]<img width="1280" height="720" alt="outgoing-challenges" src="https://github.com/user-attachments/assets/1f543057-4d52-4bfd-8faa-6a1a31a378dd" /> |

| Multiplayer match | Challenge history |
|---|---|
| ![Multiplayer match]<img width="1280" height="720" alt="multiplayer-match" src="https://github.com/user-attachments/assets/6fdd563f-485d-4a75-84e7-d467d425c118" />| ![Challenge history]<img width="1280" height="720" alt="challenge-history" src="https://github.com/user-attachments/assets/1297add0-e34a-4ec7-ba0b-1a3eeaf9c99d" /> |

### Profile and settings

| Player profile | Match history |
|---|---|
| ![Player profile]<img width="1280" height="720" alt="profile" src="https://github.com/user-attachments/assets/9cabca0d-9ddf-41b7-a562-88a05abc27f1" /> | ![Match history]<img width="1280" height="720" alt="match-history" src="https://github.com/user-attachments/assets/20ecb352-a5df-46a2-9f4b-b0e03fba53f5" /> |

| Notifications | Sound settings |
|---|---|
| ![Notifications]<img width="1280" height="720" alt="notifications" src="https://github.com/user-attachments/assets/e8a604cd-64d9-472c-b87a-c2d22fa3aa85" /> | ![Sound settings]<img width="1280" height="720" alt="sound-settings" src="https://github.com/user-attachments/assets/80fb7894-a1d9-477f-8317-c29920e5359b" /> |

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
