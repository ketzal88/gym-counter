# GymCounter

A simple web application to track gym attendance with friends. Perfect for motivating each other to go to the gym regularly!

## Features

- Track gym visits for you and a friend
- See the total count of gym visits for each person
- View gym attendance history
- Track consecutive days streak
- Data is stored in your browser's localStorage

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

## How It Works

- The app uses your browser's localStorage to keep track of gym visits
- Each person gets a counter with a "+1" button to record gym visits
- The history section shows when each person went to the gym
- The app tracks consecutive days to help maintain your gym streak

## Technologies Used

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- localStorage for data persistence
