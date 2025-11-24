# Getting Started

This guide provides instructions for setting up and running the Sonic Forge application locally.

## Prerequisites

- **Node.js**: Ensure you have a recent version of Node.js installed.
- **Gemini API Key**: You will need a valid Gemini API key to use the AI features.

## Local Development

1. **Install Dependencies**:
   Open your terminal, navigate to the project's root directory, and run the following command to install the necessary dependencies:
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**:
   Create a `.env.local` file in the project's root directory and add your Gemini API key as follows:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the Application**:
   Once the dependencies are installed and the environment variables are set, you can start the development server by running:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.
