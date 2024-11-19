# Image Coordinate Selector Tool  

This project is a web-based tool for selecting coordinates on an uploaded image. The selected image and the coordinates are sent to the backend for further processing.  

## Features  
- Upload an image and render it on the frontend.  
- Select two points on the image via mouse clicks to capture their coordinates.  
- Display the coordinates in real-time in input boxes.  
- Send the image and selected coordinates to the backend for processing.  

## Tech Stack  
- **Frontend**: Next.js  
- **Backend**: Node.js  
- **Depth Estimation**: Apple research paper for depth-efficient zero-shot monocular depth estimation  

## How It Works  
1. **Image Upload**  
   - Users can upload an image from their local system.  
   - The uploaded image is displayed below the upload button.  

2. **Select Points on Image**  
   - Users can click on two points on the displayed image.  
   - The coordinates of the clicks are displayed in two input boxes.  

3. **Send Data to Backend**  
   - The selected image and coordinates are sent to the backend using an API.  
   - The backend processes the data and performs depth estimation using Apple’s monocular depth estimation model.  

## Setup and Installation  

### Prerequisites  
- Node.js installed on your system.  
- Basic understanding of Next.js.  

### Installation Steps  

1. Clone the repository:  
2. yarn install
3. yarn run dev
# IOT_Project
