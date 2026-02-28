# StockFlow Setup Guide

## Step 1 — Open the .env file

Open this file in Notepad:
  stockflow/backend/.env

Replace this line:
  MONGODB_URI=PASTE_YOUR_MONGODB_URI_HERE

With your Atlas URI:
  MONGODB_URI=mongodb+srv://admin:admin@cluster0.kkhrcsg.mongodb.net/stockflow?retryWrites=true&w=majority&appName=Cluster0

Save the file.

---

## Step 2 — Start the Backend

Open a terminal in the backend folder and run:

  npm install
  npm run dev

You should see:
  MongoDB Connected Successfully
  Server running on http://localhost:5000

---

## Step 3 — Start the Frontend

Open a SECOND terminal in the frontend folder and run:

  npm install
  npm run dev

Open your browser at: http://localhost:5173

---

## Step 4 — Create your account

Go to http://localhost:5173/register
Fill in your name, email, password
Select role: Admin
Click Create Account

---

## Troubleshooting

Problem: MongoDB connection error
Fix: Make sure .env file has the correct MONGODB_URI
Fix: Go to MongoDB Atlas > Network Access > Add 0.0.0.0/0

Problem: Blank screen on frontend
Fix: Make sure backend is running first on port 5000
Fix: Check browser console (F12) for errors

Problem: npm install fails
Fix: Make sure Node.js 18+ is installed
Fix: Delete node_modules folder and run npm install again
