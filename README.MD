# Real-Time Online Collaboration Tool

A real-time online collaboration platform that allows multiple users to work together simultaneously on a shared whiteboard. The application enables smooth, low-latency interaction using real-time communication technologies and is accessible directly through the browser.

## Features

- Real-time collaborative whiteboard
- Multiple users can join and interact simultaneously
- Live synchronization using WebSockets
- Smooth drawing experience on HTML5 Canvas
- Browser-based application with no additional setup required

## Tech Stack

Frontend:
- React.js
- HTML5 Canvas
- CSS

Backend:
- Node.js
- Express.js
- Socket.IO

## Project Structure

realtime-collab-tool/
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
├── server/
│   ├── index.js
│   └── package.json
├── README.md
└── .gitignore

## How to Run Locally

Step 1: Clone the repository  
git clone https://github.com/<your-username>/online-collaboration-tool.git  
cd online-collaboration-tool  

Step 2: Start the backend server  
cd server  
npm install  
npm start  

Step 3: Start the frontend  
Open a new terminal  
cd client  
npm install  
npm start  

The application will be available at:  
http://localhost:3000

## System Architecture

User interactions such as drawing actions are captured on the client side and sent to the server using Socket.IO. The server then broadcasts these updates to all connected clients, ensuring that every user sees the same canvas state in real time.

## Future Enhancements

- User authentication and session management
- Persistent whiteboard storage
- Real-time chat functionality
- Undo and redo support
- Image and file sharing
- Cloud deployment and scalability improvements

## Author

N Vikas Reddy

## License

This project is developed for educational and learning purposes.
