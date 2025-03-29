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
3. Configure environment variables:
   - Copy `.env.example` to `.env.local`
   - Replace the `GOOGLE_PRIVATE_KEY` value with your Service Account private key (see "Google Sheets Integration" section)
4. Run the development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deploying to Vercel

To deploy this application to Vercel, follow these steps:

1. Fork this repository to your GitHub account
2. Go to [Vercel](https://vercel.com) and sign up/login
3. Click on "New Project"
4. Import your GitHub repository
5. Under "Environment Variables", add:
   - `GOOGLE_PRIVATE_KEY` with your Service Account private key (make sure to replace newlines with `\n`)
6. Vercel will detect it's a Next.js project and configure the build settings automatically
7. Click "Deploy"

Once deployed, you'll get a URL where your app is accessible to everyone.

## Google Sheets Integration

GymCounter can sync data with Google Sheets to enable sharing between devices. Follow these steps to set up the integration:

### Step 1: Set Up a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Enable the Google Sheets API for your project

### Step 2: Create a Service Account

1. In your Google Cloud Project, go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Give it a name (e.g., "GymCounter")
4. Grant it the "Editor" role for the project
5. Click "Create and Continue"
6. Click "Done"

### Step 3: Create Service Account Key

1. Find your service account in the list and click on it
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON" and click "Create"
5. A JSON file will be downloaded - keep it secure!

### Step 4: Share the Google Sheet

1. Use this Google Sheet: [GymCounter Spreadsheet](https://docs.google.com/spreadsheets/d/1sJmsAry32FM0A1jlyM1bWI9VyyBHedX65PyLUNVahXI/edit)  
   (or make a copy of it for your own use)
2. Click the "Share" button
3. Add the email address of your service account (it looks like: `your-account@your-project.iam.gserviceaccount.com`)
4. Give it "Editor" access
5. Click "Share"

### Step 5: Configure Environment Variables

1. Open the JSON file you downloaded
2. Find the `private_key` field (it starts with `-----BEGIN PRIVATE KEY-----` and ends with `-----END PRIVATE KEY-----`)
3. Add it to your `.env.local` file as:

   ```
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIB...[rest of your key]...1QIDAQaB\n-----END PRIVATE KEY-----\n"
   ```

   - Make sure all newlines in the key are replaced with `\n`
   - Keep the quotes around the key value

4. If you're using your own spreadsheet, also update the `SPREADSHEET_ID` constant in `src/data/sheetsService.ts`

## How It Works

- The app uses your browser's localStorage to keep track of gym visits (as a fallback)
- It synchronizes data with Google Sheets for persistence across devices
- Each person gets a counter with a "+1" button to record gym visits
- The history section shows when each person went to the gym
- The app tracks consecutive days to help maintain your gym streak
- Random motivational quotes appear to keep you inspired

## Technologies Used

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- localStorage for fallback data persistence
- Google Sheets API for cloud storage and synchronization
