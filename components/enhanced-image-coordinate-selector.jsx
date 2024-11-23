"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X } from "lucide-react";

export function EnhancedImageCoordinateSelectorComponent() {
  const [image, setImage] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [distance, setDistance] = useState(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result);
        setIsUploading(false);
        setCoordinates([]);
        setIsSubmitted(false);
        setDistance(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasClick = (e) => {
    if (coordinates.length >= 2 || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = imageRef.current.width / rect.width;
    const scaleY = imageRef.current.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    setCoordinates((prev) => [...prev, [Math.round(clickX), Math.round(clickY)]]);
  };

  const handleSubmit = async () => {
    if (!image || coordinates.length !== 2) return;

    try {
      setIsLoading(true);
      setProgress(0);

      console.log("Uploading image to ImgBB...");
      const formData = new FormData();
      formData.append("image", image.split(",")[1]); // Extract base64 data

      const imgbbResponse = await fetch(
        "https://api.imgbb.com/1/upload?key=e485587c4fca65b0ec4f7eefb439c192",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!imgbbResponse.ok) {
        console.error("ImgBB upload failed:", await imgbbResponse.text());
        throw new Error("Failed to upload image");
      }

      const imgbbData = await imgbbResponse.json();
      const imageUrl = imgbbData.data.url;
      console.log("Image uploaded successfully:", imageUrl);

      // Post the image URL and coordinates to the external endpoint
      const postResponse = await fetch(
        "https://9578kn0c-8000.inc1.devtunnels.ms/calculate-distance",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image:imageUrl, coordinates }),
        }
      );

      if (!postResponse.ok) {
        console.error("Error posting data:", await postResponse.text());
        throw new Error("Failed to post data to calculate distance");
      }

      // Start the 4-minute progress
      console.log("Data posted successfully. Starting 4-minute progress...");
      const duration = 4 * 60 * 1000; // 4 minutes in milliseconds
      const interval = 1000; // Update progress every second
      let elapsed = 0;

      const progressInterval = setInterval(() => {
        elapsed += interval;
        setProgress((elapsed / duration) * 100);

        if (elapsed >= duration) {
          clearInterval(progressInterval);
          setProgress(100);

          // Fetch the result after 4 minutes
          fetch("/api/get-distance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imageUrl, coordinates }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("API response:", data);
              if (data.distance) {
                setDistance(data.distance);
                setIsSubmitted(true);
              } else {
                console.error("API error:", data.error);
              }
            })
            .catch((error) => {
              console.error("Error calling /api/get-distance:", error);
            })
            .finally(() => {
              setIsLoading(false);
            });
        }
      }, interval);
    } catch (error) {
      console.error("Error during submission:", error);
      setIsLoading(false);
    }
  };

  const resetSelection = () => {
    setImage(null);
    setCoordinates([]);
    setIsSubmitted(false);
    setDistance(null);
  };

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        coordinates.forEach((coord, index) => {
          ctx.beginPath();
          ctx.arc(coord[0], coord[1], 10, 0, 2 * Math.PI);
          ctx.fillStyle = "red";
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.font = "16px Arial";
          ctx.fillText((index + 1).toString(), coord[0] + 10, coord[1] - 10);
        });
      };
      img.src = image;
    }
  }, [image, coordinates]);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Image Coordinate Selector</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!image ? (
          <Label htmlFor="image-upload" className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg cursor-pointer">
            <Upload className="w-8 h-8 mb-4" />
            <p>Click to upload or drag and drop an image</p>
            <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </Label>
        ) : (
          <div className="relative">
            <canvas ref={canvasRef} onClick={handleCanvasClick} className="border rounded-lg cursor-crosshair" />
            <Button variant="outline" size="icon" className="absolute top-2 right-2" onClick={resetSelection}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {coordinates.length > 0 && (
          <div>
            <h3>Selected Coordinates:</h3>
            {coordinates.map((coord, index) => (
              <p key={index}>
                Point {index + 1}: ({coord[0]}, {coord[1]})
              </p>
            ))}
          </div>
        )}

        {isLoading ? (
          <div>
            <p className="text-center">Processing your request...</p>
            <div className="relative pt-1">
              <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${progress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                />
              </div>
            </div>
          </div>
        ) : (
          <Button onClick={handleSubmit} disabled={!image || coordinates.length !== 2} className="w-full">
            Submit Coordinates
          </Button>
        )}

        {isSubmitted && distance && (
          <div className="mt-4 p-4 bg-green-100 rounded-md">
            <p>Coordinates submitted successfully!</p>
            <p>Distance: {distance}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
