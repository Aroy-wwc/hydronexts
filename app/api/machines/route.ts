// handles operations that apply to the entire collection of machines.
// app/(dashboard)/machines/route.ts
import { NextResponse } from 'next/server';
// Update the path below if your prisma client is located elsewhere
import prisma from '../../lib/prisma'; // Your shared Prisma client instance
import { MachineStatus } from '@/app/generated/prisma';

// --- GET (Read) all machines ---
// Handles GET requests to /api/dashboard/machines
// Example: GET /api/dashboard/machines
export async function GET() {
  try {
    const machines = await prisma.machine.findMany({
      orderBy: { installedAt: 'asc' }, // Order them by installation date
      // You can add filtering, pagination, etc., based on request.nextUrl.searchParams
    });
    return NextResponse.json(machines, { status: 200 });
  } catch (error) {
    console.error('Error fetching all machines:', error);
    return NextResponse.json(
      { message: 'Internal server error while fetching machines.' },
      { status: 500 }
    );
  }
}

// --- POST (Create) a new machine ---
// Handles POST requests to /api/dashboard/machines
// Example: POST /api/dashboard/machines
export async function POST(request: Request) {
  const body = await request.json(); // Get the request body as JSON

  // Basic validation for required fields
  const { locationDescription, locationLink } = body;

  if (!locationDescription || !locationLink) {
    return NextResponse.json(
      { message: 'Missing required fields: locationDescription and locationLink.' },
      { status: 400 }
    );
  }

  try {
    // You can optionally allow the client to set initial status,
    // or set a default like ACTIVE here.
    const newMachine = await prisma.machine.create({
      data: {
        locationDescription: locationDescription,
        locationLink: locationLink,
        status: MachineStatus.INACTIVE, // Default status for new machines
        installedAt: new Date(),
        // lastOnlineAt is typically set when the machine first communicates
      },
    });

    return NextResponse.json(newMachine, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('Error creating new machine:', error);
    // You might add more specific error handling here, e.g., for unique constraint violations
    return NextResponse.json(
      { message: 'Internal server error while creating machine.' },
      { status: 500 }
    );
  }
}

// You could also add other methods here that apply to the collection,
// though POST and GET are the most common for the collection route.