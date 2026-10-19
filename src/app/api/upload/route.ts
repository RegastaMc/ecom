import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function POST(request: Request) {
  try {
    // Get the form data from the request
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check if file is a Blob/File object
    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'Invalid file format' },
        { status: 400 },
      )
    }

    // Convert the file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create a data URI
    const mimeType = file.type
    const base64String = buffer.toString('base64')
    const dataURI = `data:${mimeType};base64,${base64String}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'shoppit',
      resource_type: 'auto',
    })

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed: ' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { publicId } = await request.json()

    if (!publicId) {
      return NextResponse.json(
        { error: 'No publicId provided' },
        { status: 400 },
      )
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result === 'ok') {
      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully',
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to delete image from Cloudinary' },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 },
    )
  }
}

// Configure API route to handle larger files
export const config = {
  api: {
    bodyParser: false, // Disable default body parser to handle FormData
  },
}
