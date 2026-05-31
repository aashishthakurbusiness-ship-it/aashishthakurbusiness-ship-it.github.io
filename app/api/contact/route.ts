import { NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  projectType: z.string().min(1, 'Project type is required'),
  budget: z.string().min(1, 'Budget is required'),
  message: z.string().min(1, 'Message is required').max(5000, 'Message is too long'),
  botcheck: z.string().optional()
})

function sanitizeString(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json()
    
    // Validate inputs using Zod
    const validationResult = contactSchema.safeParse(rawBody)
    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors.map(err => err.message).join(', ')
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 })
    }
    
    const validatedData = validationResult.data
    
    // Honeypot spam check
    if (validatedData.botcheck) {
      // Quietly succeed to fool the bot
      return NextResponse.json({ success: true, message: 'Spam check passed.' })
    }
    
    // Sanitize input values to protect against XSS
    const sanitizedData = {
      name: sanitizeString(validatedData.name),
      email: sanitizeString(validatedData.email),
      projectType: sanitizeString(validatedData.projectType),
      budget: sanitizeString(validatedData.budget),
      message: sanitizeString(validatedData.message),
    }

    // Dynamic import of fs/path only in development mode to prevent edge/serverless runtime compiler errors
    if (process.env.NODE_ENV === 'development') {
      try {
        const fs = await import('fs/promises')
        const path = await import('path')
        
        const filePath = path.join(process.cwd(), 'submissions.json')
        
        let submissions = []
        try {
          const fileContent = await fs.readFile(filePath, 'utf-8')
          submissions = JSON.parse(fileContent)
        } catch (e) {
          // File does not exist or invalid JSON, start fresh
        }
        
        const newSubmission = {
          ...sanitizedData,
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString()
        }
        
        submissions.push(newSubmission)
        await fs.writeFile(filePath, JSON.stringify(submissions, null, 2), 'utf-8')
        console.log('Submission successfully logged to submissions.json locally.')
      } catch (error) {
        console.error('Failed to log submission to file:', error)
      }
    }
    
    // Submit to Web3Forms using server-side key
    const accessKey = process.env.WEB3FORMS_ACCESS_KEY || process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || 'ca1b4399-6a58-4070-a57a-efd55de2e611'
    
    const web3Response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_key: accessKey,
        name: sanitizedData.name,
        email: sanitizedData.email,
        projectType: sanitizedData.projectType,
        budget: sanitizedData.budget,
        message: sanitizedData.message,
        subject: `New Project Proposal from ${sanitizedData.name} (${sanitizedData.projectType})`,
        from_name: 'Aashish Thakur Portfolio'
      })
    })
    
    const data = await web3Response.json()
    if (!web3Response.ok || !data.success) {
      throw new Error(data.message || 'Web3Forms API failed to process submission.')
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API Contact Error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
