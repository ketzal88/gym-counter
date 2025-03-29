# GymCounter

A simple web application to track gym attendance with friends. Perfect for motivating each other to go to the gym regularly!

## Features

- Track gym visits for you and a friend
- See the total count of gym visits for each person
- View gym attendance history
- Track consecutive days streak
- Inspirational quotes with each visit
- Data is stored in your browser's localStorage
- Option to sync with Google Sheets (requires setup)

## Getting Started

### Running Locally

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deploying to Vercel

To deploy this application to Vercel, follow these steps:

1. Fork this repository to your GitHub account
2. Go to [Vercel](https://vercel.com) and sign up/login
3. Click on "New Project"
4. Import your GitHub repository
5. Vercel will detect it's a Next.js project and configure the build settings automatically
6. Click "Deploy"

Once deployed, you'll get a URL where your app is accessible to everyone.

## Google Sheets Integration (Optional)

By default, GymCounter stores data in your browser's localStorage. To enable syncing between devices, follow these steps to integrate with Google Sheets:

1. Use this Google Sheet as your data source: [GymCounter Spreadsheet](https://docs.google.com/spreadsheets/d/1sJmsAry32FM0A1jlyM1bWI9VyyBHedX65PyLUNVahXI/edit)
2. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
3. Enable the Google Sheets API in your project
4. Create API credentials (either an API Key or Service Account)
5. If using a Service Account, share the spreadsheet with the Service Account email
6. Update the code in `src/data/sheetsService.ts` with your credentials

For detailed steps, see the [Google Spreadsheet documentation](https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication).

## How It Works

- The app uses your browser's localStorage to keep track of gym visits
- Each person gets a counter with a "+1" button to record gym visits
- The history section shows when each person went to the gym
- The app tracks consecutive days to help maintain your gym streak
- Random motivational quotes appear to keep you inspired

## Technologies Used

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- localStorage for data persistence
- Google Sheets API (optional integration)
