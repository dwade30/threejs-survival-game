# Three.js Survival Game

A simple survival game built with Three.js where you can collect wood from trees and craft campfires.

## Features

- First-person movement with WASD keys
- Mouse look controls
- Collect wood by clicking on trees
- Craft campfires when you have enough wood
- Dynamic lighting from campfires

## Controls

- **WASD**: Move around
- **Mouse**: Look around
- **Left Click**: Collect wood from trees
- **C**: Craft campfire (requires 5 wood)
- **ESC**: Toggle mouse capture

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL shown in the terminal

## How to Play

1. Click anywhere on the game to start (this will capture your mouse)
2. Move around using WASD keys and look around with the mouse
3. Find trees in the environment
4. Click on trees to collect wood
5. Once you have 5 wood, press 'C' to create a campfire at your current position
6. Press ESC to release the mouse cursor

## Technologies Used

- Three.js
- Vite (for development and building)