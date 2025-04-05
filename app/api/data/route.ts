import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Get the file parameter from the URL
    const searchParams = request.nextUrl.searchParams;
    const file = searchParams.get('file');

    if (!file) {
      return new NextResponse(JSON.stringify({ error: 'File parameter is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Security check - ensure the file name is just alphanumeric plus underscore
    if (!/^[a-zA-Z0-9_]+\.csv$/.test(file)) {
      return new NextResponse(JSON.stringify({ error: 'Invalid file name' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Try multiple potential file paths
    const potentialPaths = [
      path.join(process.cwd(), 'data', file),          // /data/
      path.join(process.cwd(), 'public', 'data', file) // /public/data/
    ];
    
    let filePath = '';
    let fileExists = false;
    
    // Check each potential path
    for (const potPath of potentialPaths) {
      if (fs.existsSync(potPath)) {
        filePath = potPath;
        fileExists = true;
        break;
      }
    }
    
    // If no file exists in any path
    if (!fileExists) {
      console.error(`File not found in any location: ${file}`);
      console.log('Looked in paths:', potentialPaths);
      return new NextResponse(JSON.stringify({ 
        error: 'File not found',
        paths: potentialPaths 
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Read the file
    console.log(`Reading CSV file from: ${filePath}`);
    const csvData = fs.readFileSync(filePath, 'utf8');

    // Return the CSV data
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
      },
    });
  } catch (error) {
    console.error('Error serving CSV file:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 