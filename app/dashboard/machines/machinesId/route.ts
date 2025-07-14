// handles operations that apply to specific machines by their ID.
// app/(dashboard)/machines/[machineId]/route.ts
import { NextResponse } from 'next/server';
// Update the path below if your prisma client is located elsewhere
import prisma from '../../../lib/prisma'; // Your shared Prisma client instance
import { MachineStatus } from '@prisma/client'; // Import the MachineStatus enum for type safety

// --- GET (Read) a specific machine by ID ---
// Handles GET requests to /api/dashboard/machines/[machineId]
// Example: GET /api/dashboard/machines/f8a7e6d5-c4b3-a2a1-1234-567890abcdef
export async function GET(
  request: Request,
  { params }: { params: { machineId: string } } // `params` contains dynamic route segments
) {
  const { machineId } = params;

  try {
    const machine = await prisma.machine.findUnique({
      where: { id: machineId },
      // You can include related data if needed
      include: {
        hourlyReports: {
          orderBy: { reportTimestamp: 'desc' }, // Get most recent reports
          take: 5, // Limit to last 5 reports for efficiency
        },
        maintenanceLogs: {
          orderBy: { maintenanceDate: 'desc' },
          take: 3, // Limit to last 3 logs
        },
        qrCodePayments: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Limit recent QR payments
        },
      },
    });

    if (!machine) {
      // If no machine is found with the given ID
      return NextResponse.json(
        { message: `Machine with ID ${machineId} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(machine, { status: 200 });
  } catch (error) {
    console.error(`Error fetching machine ${machineId}:`, error);
    return NextResponse.json(
      { message: 'Internal server error while fetching machine.' },
      { status: 500 }
    );
  }
}

// --- PUT (Update/Replace) a specific machine by ID ---
// Handles PUT requests to /api/dashboard/machines/[machineId]
// Use PUT for full replacement of the resource, PATCH for partial updates.
// Example: PUT /api/dashboard/machines/f8a7e6d5-c4b3-a2a1-1234-567890abcdef
export async function PUT(
  request: Request,
  { params }: { params: { machineId: string } }
) {
  const { machineId } = params;
  const body = await request.json(); // Get the request body as JSON

  // Basic validation for required fields for an update
  // For a PUT, you typically expect all fields of the resource, but here we'll update specific ones.
  const { locationDescription, locationLink, status } = body;

  if (!locationDescription || !locationLink || !status) {
    return NextResponse.json(
      { message: 'Missing required fields for update (locationDescription, locationLink, status).' },
      { status: 400 }
    );
  }

  // Validate status against your enum
  if (!Object.values(MachineStatus).includes(status)) {
    return NextResponse.json(
      { message: `Invalid status provided. Must be one of: ${Object.values(MachineStatus).join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const updatedMachine = await prisma.machine.update({
      where: { id: machineId },
      data: {
        locationDescription: locationDescription,
        locationLink: locationLink,
        status: status,
        lastOnlineAt: new Date(), // Optionally update lastOnlineAt on any update
      },
    });

    return NextResponse.json(updatedMachine, { status: 200 });
  } catch (error) {
    // Check if the error is due to a record not being found
    if ((error as any).code === 'P2025') { // Prisma error code for RecordNotFound
      return NextResponse.json(
        { message: `Machine with ID ${machineId} not found for update.` },
        { status: 404 }
      );
    }
    console.error(`Error updating machine ${machineId}:`, error);
    return NextResponse.json(
      { message: 'Internal server error while updating machine.' },
      { status: 500 }
    );
  }
}


// --- DELETE a specific machine by ID ---
// Handles DELETE requests to /api/dashboard/machines/[machineId]
// Example: DELETE /api/dashboard/machines/f8a7e6d5-c4b3-a2a1-1234-567890abcdef
export async function DELETE(
  request: Request,
  { params }: { params: { machineId: string } }
) {
  const { machineId } = params;

  try {
    // Before deleting the machine, you might need to handle related records
    // depending on your Prisma schema's onDelete policies.
    // For example, you might need to delete related reports, payments, and logs first
    // if you don't have CASCADE DELETE set up or want more control.
    // E.g.: await prisma.hourlyMachineReport.deleteMany({ where: { machineId } });

    const deletedMachine = await prisma.machine.delete({
      where: { id: machineId },
    });

    // Respond with a 204 No Content status for successful deletion
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if ((error as any).code === 'P2025') { // Prisma error code for RecordNotFound
      return NextResponse.json(
        { message: `Machine with ID ${machineId} not found for deletion.` },
        { status: 404 }
      );
    }
    console.error(`Error deleting machine ${machineId}:`, error);
    return NextResponse.json(
      { message: 'Internal server error while deleting machine.' },
      { status: 500 }
    );
  }
}