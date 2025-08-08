# GPT-5 Project

This project contains a client (frontend) and a server (backend), both using npm for package management.

## Project Structure

```
gpt-5-vibe-coded/
  client/    # Frontend React app
  server/    # Backend Node.js server
```

---

## Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/)

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/rehanthestar21/gpt-5-chatbot.git
cd gpt-5-chatbot
```

### 2. Install Dependencies
#### Client
```bash
cd client
npm install
```

#### Server
```bash
cd ../server
npm install
```

---

## Environment Variables (Server)

The server requires a `.env` file in the `server/` directory. Create a file named `.env` inside the `server` folder with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=your_openai_model_here
PORT=5000 # or any port you prefer
```

- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_MODEL`: The model name to use (e.g., `gpt-5`)
- `PORT`: 3001

---

## Running the Applications

### Start the Server
```bash
cd server
npm start
```

### Start the Client
In a new terminal:
```bash
cd client
npm run dev
```

---

## Development
- The client is a React app (see `client/`)
- The server is a Node.js app (see `server/`)
- Both use npm for scripts and dependency management

---

## Additional Notes
- Update the README with any new scripts or environment variables as your project evolves.
- Make sure to run the server and client in separate terminals during development. 
