
// MQTT and Prisma setup
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { connect } = require('mqtt');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient();


// HiveMQ Cloud connection details
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtts://your-hivemq-cloud-url:8883'; // Use 'mqtts' for TLS
const MQTT_USERNAME = process.env.MQTT_USERNAME || 'your-hivemq-username';
const MQTT_PASSWORD = process.env.MQTT_PASSWORD || 'your-hivemq-password';

// Connect to HiveMQ Cloud broker
const client = connect(MQTT_BROKER_URL, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
  // For testing only: rejectUnauthorized: false,
});

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  // Subscribe to all machine hourly report topics
  client.subscribe('machines/+/report/hourly', (err) => {
    if (err) {
      console.error('Subscription error:', err);
    } else {
      console.log('Subscribed to machines/+/report/hourly');
    }
  });
});

client.on('message', async (topic, message) => {
  try {
    // Extract machineId from topic
    // topic format: machines/{machineId}/report/hourly
    const match = topic.match(/^machines\/(.+)\/report\/hourly$/);
    if (!match) {
      console.warn('Received message on unexpected topic:', topic);
      return;
    }
    const machineId = match[1];

    // Parse message payload (should be JSON)
    const data = JSON.parse(message.toString());

    // Create HourlyMachineReport in DB
    await prisma.hourlyMachineReport.create({
      data: {
        machineId,
        reportTimestamp: new Date(data.reportTimestamp),
        totalRoDispensed: data.totalRoDispensed,
        totalAlDispensed: data.totalAlDispensed,
        totalMiDispensed: data.totalMiDispensed,
        totalQrRevenue: data.totalQrRevenue,
        totalCashRevenue: data.totalCashRevenue,
        numCashTransaction: data.numCashTransaction,
        numQrTransaction: data.numQrTransaction,
        totalSBtlCount: data.totalSBtlCount,
        totalMBtlCount: data.totalMBtlCount,
        totalLBtlCount: data.totalLBtlCount,
        totalXlBtlCount: data.totalXlBtlCount,
        // receivedAt will default to now()
      },
    });
    console.log(`Hourly report saved for machine ${machineId}`);
  } catch (err) {
    console.error('Failed to process MQTT message:', err);
  }
});

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  client.end();
  process.exit(0);
});
