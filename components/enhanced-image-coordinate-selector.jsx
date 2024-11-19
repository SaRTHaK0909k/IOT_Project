'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X } from 'lucide-react'

export function EnhancedImageCoordinateSelectorComponent() {
  const [image, setImage] = useState(null)
  const [coordinates, setCoordinates] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const canvasRef = useRef(null)
  const imageRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result)
        setIsUploading(false)
        setCoordinates([])
        setIsSubmitted(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCanvasClick = (e) => {
    if (coordinates.length >= 2 || !canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = imageRef.current.width / rect.width
    const scaleY = imageRef.current.height / rect.height

    const clickX = (e.clientX - rect.left) * scaleX
    const clickY = (e.clientY - rect.top) * scaleY

    setCoordinates(prev => [...prev, [Math.round(clickX), Math.round(clickY)]])
  }

  const handleSubmit = async () => {
    if (!image || coordinates.length !== 2) return

    try {
      // Replace 'https://your-api-endpoint.com/process-image' with your actual API endpoint
      const response = await fetch('https://your-api-endpoint.com/process-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, coordinates }),
      })

      if (!response.ok) throw new Error('Failed to submit data')

      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting coordinates:', error)
    }
  }

  const resetSelection = () => {
    setCoordinates([])
    setIsSubmitted(false)
    if (canvasRef.current && imageRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx?.drawImage(imageRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        imageRef.current = img
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        
        coordinates.forEach((coord, index) => {
          if (ctx) {
            ctx.beginPath()
            ctx.arc(coord[0], coord[1], 10, 0, 2 * Math.PI)
            ctx.fillStyle = 'red'
            ctx.fill()
            ctx.fillStyle = 'white'
            ctx.font = '32px Arial'
            ctx.fillText((index + 1).toString(), coord[0] + 10, coord[1] - 10)
          }
        })
      }
      img.src = image
    }
  }, [image, coordinates])

  return (
    (<Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Image Coordinate Selector</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <Label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or GIF (MAX. 800x400px)</p>
            </div>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden" />
          </Label>
        </div>

        {isUploading && <p className="text-center">Uploading image...</p>}

        {image && (
          <div className="mt-4 relative">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="border border-gray-300 rounded-lg cursor-crosshair max-w-full h-auto" />
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2"
              onClick={resetSelection}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {coordinates.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Selected Coordinates:</h3>
            {coordinates.map((coord, index) => (
              <p key={index}>Point {index + 1}: ({coord[0]}, {coord[1]})</p>
            ))}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!image || coordinates.length !== 2 || isSubmitted}
          className="w-full">
          Submit Coordinates
        </Button>

        {isSubmitted && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
            Coordinates submitted successfully!
            <p>Point 1: ({coordinates[0][0]}, {coordinates[0][1]})</p>
            <p>Point 2: ({coordinates[1][0]}, {coordinates[1][1]})</p>
          </div>
        )}
      </CardContent>
    </Card>)
  );
}